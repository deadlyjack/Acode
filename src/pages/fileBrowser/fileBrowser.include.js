//#region Imports
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import fs from '../../modules/utils/internalFs';
import helpers from '../../modules/helpers';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import constants from "../../constants";
import filesSettings from '../settings/filesSettings';

import _template from './fileBrowser.hbs';
import _list from './list.hbs';
import _addMenu from './add-menu.hbs';
import './fileBrowser.scss';
import externalFs from '../../modules/utils/externalFs';
import fsOperation from '../../modules/utils/fsOperation';
import SearchBar from '../../components/searchbar';
import projects from './projects';
//#endregion
/**
 * 
 * @param {"file"|"dir"} [type='file']
 * @param {string|function(string):boolean} option button text or function to check extension
 */
function FileBrowserInclude(type, option, defaultPath) {
  if (!type) type = 'file';
  if (!defaultPath && localStorage.lastDir) defaultPath = localStorage.lastDir;
  const actionStack = window.actionStack;
  const prompt = dialogs.prompt;
  return new Promise((_resolve, reject) => {
    //#region Declaration
    const $menuToggler = tag('i', {
      className: 'icon more_vert',
      attr: {
        action: 'toggle-menu'
      }
    });
    const $addMenuToggler = tag('i', {
      className: 'icon add disabled',
      attr: {
        action: 'toggle-add-menu'
      }
    });
    const $search = tag('i', {
      className: 'icon search',
      attr: {
        action: 'search'
      }
    });
    const $page = Page('File Browser');
    const $content = tag.parse(mustache.render(_template, {
      type
    }));
    const $navigation = $content.querySelector('.navigation');
    const actionsToDispose = [];
    const menuOption = {
      top: '8px',
      right: '8px',
      toggle: $menuToggler,
      transformOrigin: 'top right'
    };
    const $fbMenu = contextMenu(
      `<li action="settings">${strings.settings}</li>`,
      menuOption
    );
    const $addMenu = contextMenu(
      mustache.render(_addMenu, strings),
      (menuOption.toggle = $addMenuToggler) && menuOption
    );
    const root = 'file:///storage/';
    let cachedDir = {};
    let currentDir = {
      url: root,
      name: 'File browser'
    };
    let folderOption;
    //#endregion

    $content.addEventListener('click', handleClick);
    $content.addEventListener('contextmenu', handleContextMenu);
    $page.append($content);
    $page.querySelector('header').append($search, $addMenuToggler, $menuToggler);
    document.body.append($page);

    actionStack.push({
      id: 'filebrowser',
      action: function () {
        reject({
          error: 'user canceled',
          code: 0
        });
        $page.hide();
      }
    });

    $fbMenu.onclick = function (e) {
      $fbMenu.hide();
      const action = e.target.getAttribute('action');
      if (action && action === 'settings') {
        filesSettings(refresh);
      }
    };

    $addMenu.onclick = function (e) {
      $addMenu.hide();
      const action = e.target.getAttribute('action');
      const value = e.target.getAttribute('value');
      if (action && action === 'create') {
        create(value);
      }
    };

    $search.onclick = function () {
      const $list = $content.get("#list");
      if ($list) SearchBar($list);
    };

    $page.onhide = function () {
      let id = '';
      while ((id = actionsToDispose.pop())) {
        actionStack.remove(id);
      }
      actionStack.remove('filebrowser');
      $content.removeEventListener('click', handleClick);
      $content.removeEventListener('contextmenu', handleContextMenu);
    };

    if (type === 'folder') {
      const openFolder = tag('button', {
        textContent: option || strings['select folder']
      });
      folderOption = tag('footer', {
        className: 'button-container',
        child: openFolder
      });

      $page.setAttribute('footer-height', 1);
      $page.append(folderOption);

      openFolder.onclick = () => {
        $page.hide();
        resolve(currentDir);
      };
    }

    // if (defaultPath) {

    //     navigate('/', root);
    //     actionStack.push({
    //         id: defaultPath,
    //         action: () => {
    //             navigate.pop();
    //             genList();
    //         }
    //     });
    //     loadDir(defaultPath, path.name(defaultPath));

    // } else {

    // }

    const version = parseInt(device.version);
    if (version < 7) {
      genList();
    } else {
      externalFs.listExternalStorages()
        .then(res => {
          genList(res);
        });
    }

    function resolve(data) {
      localStorage.setItem("lastDir", currentDir.url);
      _resolve(data);
    }

    function genList(res) {
      cordova.plugins.diagnostic.getExternalSdCardDetails(ls => {
        const list = [];
        if (ls.length > 0) {
          ls.map(card => {
            const name = card.path.split('/').splice(-1)[0];
            const path = card.filePath + '/';
            if (name === "files") return card;
            list.push({
              name: res && res[name] ? res[name] : name,
              nativeURL: path,
              origin: path,
              isDirectory: true,
              parent: true,
              type: 'folder'
            });
            return card;
          });
        }

        const path = cordova.file.externalRootDirectory;
        list.push({
          nativeURL: path,
          name: 'Internal storage',
          isDirectory: true,
          parent: true,
          type: 'folder',
        });

        if (type === "file") {
          list.push({
            name: "Select document",
            isDirectory: true,
            type: 'folder',
            "open-doc": true
          });
        }

        cachedDir[root] = {
          name,
          list
        };

        navigate('/', root);
        render(list);

        if (type === 'folder') {
          folderOption.classList.add('disabled');
        }
      });
    }

    function loadDir(path = root, name = 'File Browser') {

      let url = path;

      if (typeof path === 'object') {
        url = path.url;
        name = path.name;
      }

      if (url in cachedDir) {
        update();
        const item = cachedDir[url];
        render(item.list);
        const $list = tag.get('#list');
        $list.scrollTop = item.scroll;
        name = item.name;
      } else {
        fs.listDir(url)
          .then(list => {
            update();
            list = helpers.sortDir(list,
              appSettings.value.fileBrowser
            );
            cachedDir[url] = {
              name,
              list
            };
            render(list);
          })
          .catch(err => {
            actionStack.remove(currentDir.url);
            helpers.error(err, url);
            console.error(err);
          });
      }

      function update() {
        if (type === 'folder')
          if (url === root) {
            $addMenuToggler.classList.add('disabled');
            folderOption.classList.add('disabled');
          } else {
            $addMenuToggler.classList.remove('disabled');
            folderOption.classList.remove('disabled');
          }

        currentDir.url = url;
        currentDir.name = name;
        const $list = tag.get('#list');
        if ($list) $list.scrollTop = 0;
        navigate(name, url);
        $page.settitle(name);
      }
    }

    /**
     * 
     * @param {MouseEvent} e 
     * @param {"contextmenu"} [contextMenu] 
     */
    function handleClick(e, contextMenu) {
      /**
       * @type {HTMLElement}
       */
      const $el = e.target;
      let action = $el.getAttribute('action');
      if (!action) return;

      const url = $el.getAttribute('url');
      const name = $el.getAttribute('name');
      const opendoc = $el.getAttribute('open-doc');

      if (opendoc) action = "open-doc";

      switch (action) {
        case 'navigation':
        case 'folder':
          folder();
          break;
        case 'file':
          file();
          break;
        case "open-doc":
          openDoc();
          break;
      }

      function folder() {
        if (contextMenu !== 'contextmenu') {
          const currentUrl = currentDir.url;
          const dir = JSON.parse(JSON.stringify(currentDir));
          cachedDir[currentUrl].scroll = tag.get('#list').scrollTop;
          actionsToDispose.push(currentUrl);
          actionStack.push({
            id: currentUrl,
            action: function () {
              actionsToDispose.pop();
              loadDir(dir);
              if (action === 'folder') navigate.pop();
            }
          });
          loadDir(url, name);
        } else {
          cmhandle();
        }
      }

      function file() {
        if (contextMenu !== "contextmenu") {
          if (typeof option === 'function' && option(name)) {
            $page.hide();
            resolve({
              url
            });
          }
        } else {
          cmhandle();
        }
      }

      function cmhandle() {
        navigator.vibrate(50);
        dialogs.select('', [
            ['delete', strings.delete, 'delete'],
            ['rename', strings.rename, 'edit']
          ])
          .then(res => {

            switch (res) {
              case 'delete':
                dialogs.confirm(strings["delete {name}"].replace('{name}', name))
                  .then(remove);
                break;
              case 'rename':
                dialogs.prompt(strings.rename, name, "text", {
                  match: constants.FILE_NAME_REGEX
                }).then(newname => {
                  rename(newname);
                });
                break;
            }

          });
      }

      function rename(newname) {
        fsOperation(url)
          .then(fs => {
            return fs.renameTo(newname);
          })
          .then(() => {
            updateAddedFolder(url);
            window.plugins.toast.showShortBottom(strings.success);
            loadDir(currentDir);
          })
          .catch(err => {
            helpers.error(err);
            console.error(err);
          });
      }

      function remove() {
        fsOperation(url)
          .then(fs => {
            return fs.deleteFile();
          })
          .then(() => {
            updateAddedFolder(url);
            window.plugins.toast.showShortBottom(strings.success);
            loadDir(currentDir);
          })
          .catch(err => {
            console.log(err);
            helpers.error(err);
          });
      }

      function openDoc() {
        SDcard.openDoc(res => {
          res.isContentUri = true;
          res.url = res.uri;
          resolve(res);
          $page.hide();

        }, err => {
          helpers.error(err);
          console.error(err);
        });
      }
    }

    function handleContextMenu(e) {
      handleClick(e, 'contextmenu');
    }

    function refresh() {
      cachedDir = {};
      loadDir(currentDir.url, currentDir.name);
    }

    function render(list) {
      const $list = tag.parse(mustache.render(_list, {
        msg: strings['empty folder message'],
        list
      }));

      const $oldList = $content.querySelector('#list');
      if ($oldList) $oldList.remove();
      $content.append($list);
      $list.focus();
    }

    function navigate(name, url) {
      let $nav = $navigation.querySelector(`[url="${url}"]`);
      const $old = $navigation.querySelector('.active');
      if ($old) $old.classList.remove('active');
      if ($nav) return $nav.classList.add('active');

      $nav = tag('span', {
        className: 'nav active',
        attr: {
          action: 'navigation',
          url,
          text: name,
          name
        },
        tabIndex: -1
      });

      $navigation.append($nav);
      $navigation.scrollLeft = $navigation.scrollWidth;
    }

    navigate.pop = function () {
      const $nav = $navigation.lastChild;
      if ($nav) $nav.remove();
    };

    function updateAddedFolder(url) {
      if (cachedDir[url]) delete cachedDir[url];
      if (cachedDir[currentDir.url]) delete cachedDir[currentDir.url];
      for (let folder of addedFolder) {
        if (folder.url === url) {
          folder.remove();
        } else if (new RegExp(url).test(currentDir.url)) {
          folder.reload();
        }
      }
    }

    /**
     * 
     * @param {"file"|"folder"|"project"} arg 
     */
    function create(arg) {
      const {
        url,
        name
      } = currentDir;


      if (arg === "file" || arg === "folder") {
        let title = strings['enter folder name'];
        let val = strings['new folder'];
        if (arg === "file") {
          title = strings["enter file name"];
          val = 'untitiled.txt';
        }
        prompt(title, val, 'filename', {
          match: constants.FILE_NAME_REGEX,
          required: true
        }).then(entryName => {
          if (!entryName) return;
          entryName = helpers.removeLineBreaks(entryName);

          fsOperation(url)
            .then(fs => {
              if (arg === "folder") return fs.createDirectory(entryName);
              if (arg === "file") return fs.createFile(entryName);
            })
            .then(() => {
              updateAddedFolder(url);
              window.plugins.toast.showLongBottom(strings.success);
              loadDir(url, name);
            }).catch(e => {
              helpers.error(e, url, "filename: " + entryName);
              console.error(e);
            });
        });
      } else if (arg === "project") {

        const options = [];
        const alreadyCreated = [];
        let project = '';
        let cturl = '';
        let newUrl = null;
        let projectName = '';
        let framework = '';

        Object.keys(projects).map(projectname => {
          options.push([projectname, projectname, "icon " + projectname]);
        });

        dialogs.select(strings["new project"], options)
          .then(res => {
            framework = res;
            dialogs.loaderShow(res, strings.loading + '...');
            return projects[res]();
          })
          .then(res => {
            dialogs.loaderHide();
            project = res.default;
            return dialogs.prompt(strings["project name"], framework, "text", {
              required: true,
              match: constants.FILE_NAME_REGEX
            });
          })
          .then(name => {
            projectName = name;
            return fsOperation(url);
          })
          .then(fs => {
            dialogs.loaderShow(projectName, strings.loading + '...');
            return fs.createDirectory(projectName);
          })
          .then(res => {
            newUrl = url + projectName + '/';
            const files = Object.keys(project);

            return new Promise((resolve, reject) => {
              createProject(resolve, reject);
            });

            function createProject(resolve, reject) {
              if (!files.length) {
                updateAddedFolder(url);
                window.plugins.toast.showLongBottom(strings.success);
                loadDir(url, name);
                resolve();
              }
              const file = files.pop();
              cturl = [];
              createFile(file)
                .then(() => {
                  createProject(resolve, reject);
                })
                .catch(reject);
            }

            function createFile(fileurl) {
              const paths = fileurl.split("/");
              const filename = paths.pop();

              return new Promise((resolve, reject) => {
                createDir();

                function createDir() {
                  const lclUrl = newUrl + cturl;

                  if (paths.length === 0) {
                    return fsOperation(lclUrl)
                      .then(fs => {
                        const data = project[fileurl].replace(/<%name%>/g, projectName);
                        return fs.createFile(filename, data);
                      })
                      .then(resolve)
                      .catch(reject);
                  }

                  const name = paths.splice(0, 1)[0];
                  const toCreate = lclUrl + name;

                  fsOperation(lclUrl)
                    .then(fs => {
                      if (alreadyCreated.includes(toCreate)) return Promise.resolve();
                      return fs.createDirectory(name);
                    })
                    .then(res => {
                      if (!alreadyCreated.includes(toCreate)) alreadyCreated.push(toCreate);
                      cturl += name + '/';
                      return createDir(paths);
                    })
                    .catch(reject);
                }
              });
            }

          })
          .catch(err => {
            helpers.error(err);
            console.error(err);
          })
          .finally(() => {
            dialogs.loaderHide();
          });

      }

    }
  });
}

export default FileBrowserInclude;