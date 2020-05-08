//#region Imports
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import helpers from '../../lib/utils/helpers';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import constants from "../../lib/constants";
import filesSettings from '../settings/filesSettings';

import _template from './fileBrowser.hbs';
import _list from './list.hbs';
import _addMenu from './add-menu.hbs';
import './fileBrowser.scss';
import externalFs from '../../lib/fileSystem/externalFs';
import fsOperation from '../../lib/fileSystem/fsOperation';
import SearchBar from '../../components/searchbar';
import projects from './projects';
import decryptAccounts from '../ftp-accounts/decryptAccounts';
import Url from '../../lib/utils/Url';
import path from '../../lib/utils/path';
//#endregion
/**
 * 
 * @param {"file"|"dir"} [type='file']
 * @param {string|function(string):boolean} option button text or function to check extension
 */
function FileBrowserInclude(type, option, defaultPath) {
  if (!type) type = 'file';
  if (!defaultPath && localStorage.lastDir) defaultPath = localStorage.lastDir;
  return new Promise(render);
}

function render(resolve, reject) {
  //#region Declaration
  const $menuToggler = tag('i', {
    className: 'icon more_vert',
    attr: {
      action: ''
    }
  });
  const $addMenuToggler = tag('i', {
    className: 'icon add disabled',
    attr: {
      action: ''
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
  //#endregion

  $page.addEventListener('click', handleClick);
  $page.addEventListener('contextmenu', handleContextMenu);
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

  $page.onhide = function () {
    let id = '';
    while ((id = actionsToDispose.pop())) {
      actionStack.remove(id);
    }
    actionStack.remove('filebrowser');
    $page.removeEventListener('click', handleClick);
    $page.removeEventListener('contextmenu', handleContextMenu);
  };

  if (type === 'folder') {
    const openFolder = tag('button', {
      textContent: option || strings['select folder'],
      attr: {
        action: "open-folder"
      }
    });
    folderOption = tag('footer', {
      className: 'button-container',
      child: openFolder
    });

    $page.setAttribute('footer-height', 1);
    $page.append(folderOption);
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handleClick(e) {
    const $target = e.target;
    if (!($target instanceof HTMLElement)) return;
    const action = $target.getAttribute('action');
    if (!action) return;
  }

  function actions(action) {
    switch (action) {
      case value:

        break;

      default:
        break;
    }
  }

  function renderList(list) {

  }

  function getListOfStorages() {

  }

  function createaProject() {
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
        newUrl = Url.join(url, projectName, "/");
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
          cturl = '';
          const file = files.pop();
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
              const lclUrl = Url.join(newUrl, cturl);

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
              const toCreate = Url.join(lclUrl, name);

              fsOperation(lclUrl)
                .then(fs => {
                  if (alreadyCreated.includes(toCreate)) return Promise.resolve();
                  return fs.createDirectory(name);
                })
                .then(res => {
                  if (!alreadyCreated.includes(toCreate))
                    alreadyCreated.push(toCreate);
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

  function create(type, url) {
    let title = strings['enter folder name'];
    let val = strings['new folder'];
    if (type === "file") {
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
          if (type === "folder") return fs.createDirectory(entryName);
          if (type === "file") return fs.createFile(entryName);
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
  }

  function remove(type, url) {
    fsOperation(url)
      .then(fs => {
        if (type === "file") return fs.deleteFile();
        if (type === "folder") return fs.deleteDir();
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

  function rename(url, name) {
    dialogs.prompt(strings.rename, name, "text", {
      match: constants.FILE_NAME_REGEX
    }).then(newname => {
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
    });
  }

  function navigate(url, name) {
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
}

export default FileBrowserInclude;