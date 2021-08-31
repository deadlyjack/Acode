import './fileBrowser.scss';
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import helpers from '../../lib/utils/helpers';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import constants from '../../lib/constants';
import filesSettings from '../settings/filesSettings';
import _template from './fileBrowser.hbs';
import _list from './list.hbs';
import _addMenu from './add-menu.hbs';
import _addMenuHome from './add-menu-home.hbs';
import externalFs from '../../lib/fileSystem/externalFs';
import fsOperation from '../../lib/fileSystem/fsOperation';
import searchBar from '../../components/searchbar';
import projects from './projects';
import Url from '../../lib/utils/Url';
import util from './util';
import openFolder from '../../lib/openFolder';
import recents from '../../lib/recents';
import remoteStorage from '../../lib/remoteStorage';
import URLParse from 'url-parse';

/**
 *
 * @param {import('./fileBrowser').BrowseMode} [mode='file']
 * @param {function(string):boolean} [buttonText] button text or function to check extension
 * @param {string} [info]
 * @param {boolean} [doesOpenLast]
 * @returns {Promise<import('./fileBrowser').SelectedFile>}
 */
function FileBrowserInclude(
  mode,
  info,
  buttonText = strings['select folder'],
  doesOpenLast = true,
  defaultDir
) {
  if (!mode) mode = 'file';

  const IS_FOLDER_MODE = ['folder', 'both'].includes(mode);
  const IS_FILE_MODE = ['file', 'both'].includes(mode);

  let fileBrowserState = [
    {
      url: '/',
      name: '/',
    },
  ];
  let fileBrowserOldState = JSON.parse(localStorage.fileBrowserState || '[]');
  const prompt = dialogs.prompt;
  /**@type {Array<{name: string, uuid: string, url: string, home: String}>} */
  let allStorages = JSON.parse(localStorage.storageList || '[]');
  const saveStoragList = () => {
    localStorage.storageList = JSON.stringify(allStorages);
  };

  if (!info) {
    if (mode !== 'both') {
      info = IS_FOLDER_MODE ? strings['open folder'] : strings['open file'];
    } else {
      info = strings['file browser'];
    }
  }

  return new Promise((_resolve, reject) => {
    //#region Declaration
    const $menuToggler = tag('i', {
      className: 'icon more_vert',
      attr: {
        action: 'toggle-menu',
      },
    });
    const $addMenuToggler = tag('i', {
      className: 'icon add',
      attr: {
        action: 'toggle-add-menu',
      },
    });
    const $search = tag('i', {
      className: 'icon search',
      attr: {
        action: 'search',
      },
    });
    const $lead = tag('span', {
      className: 'icon clearclose',
      attr: {
        action: 'close',
      },
    });
    const $page = Page(strings['file browser'].capitalize(), {
      lead: $lead,
    });
    const $content = tag.parse(
      mustache.render(_template, {
        type: mode,
        info,
      })
    );
    const $navigation = $content.querySelector('.navigation');
    const menuOption = {
      top: '8px',
      right: '8px',
      toggle: $menuToggler,
      transformOrigin: 'top right',
    };
    const $fbMenu = contextMenu({
      innerHTML: () => {
        const notice = !localStorage.__fbHelp ? "class='notice'" : '';
        return `<li action="settings">${strings.settings.capitalize(0)}</li>
<li action="reload">${strings.reload.capitalize(0)}</li>
<li action="help" ${notice}>${strings.help.capitalize(0)}</li>`;
      },
      ...menuOption,
    });
    const $addMenu = contextMenu({
      innerHTML: () => {
        if (currentDir.url === '/') {
          const addSftpNotice = !localStorage.__fbAddSftp;
          const addPathNotice = !localStorage.__fbAddPath;
          return mustache.render(_addMenuHome, {
            addPathNotice,
            addSftpNotice,
            ...strings,
          });
        } else {
          return mustache.render(_addMenu, strings);
        }
      },
      ...((menuOption.toggle = $addMenuToggler) && menuOption),
    });
    const root = 'file:///storage/';
    let cachedDir = {};
    let currentDir = {
      url: '/',
      name: strings['file browser'],
    };
    let folderOption;
    //#endregion

    actionStack.setMark();
    $lead.onclick = $page.hide;
    $content.addEventListener('click', handleClick);
    $content.addEventListener('contextmenu', handleContextMenu);
    $page.append($content);
    $page
      .querySelector('header')
      .append($search, $addMenuToggler, $menuToggler);
    document.body.append($page);

    actionStack.push({
      id: 'filebrowser',
      action: function () {
        const err = new Error('User cancelled');
        Object.defineProperty(err, 'code', {
          value: 0,
        });
        reject(err);
        $page.hide();
      },
    });

    $fbMenu.onclick = function (e) {
      $fbMenu.hide();
      const action = e.target.getAttribute('action');
      if (action === 'settings') {
        filesSettings(refresh);
        return;
      }

      if (action === 'reload') {
        const { url, name } = currentDir;
        if (url in cachedDir) delete cachedDir[url];
        loadDir(url, name);
        return;
      }

      if (action === 'help') {
        localStorage.__fbHelp = true;
        $menuToggler.classList.remove('notice');
        alert(strings.info.toUpperCase(), strings['file browser help']);
        return;
      }
    };

    $addMenu.onclick = function (e) {
      $addMenu.hide();
      const $target = e.target;
      const action = $target.getAttribute('action');
      const value = $target.getAttribute('value');
      if (!action) return;

      switch (action) {
        case 'create':
          create(value);
          break;

        case 'add-path':
          localStorage.__fbAddPath = true;
          $addMenuToggler.classList.remove('notice');
          util
            .addPath()
            .then((res) => {
              allStorages.push(res);
              localStorage.storageList = JSON.stringify(allStorages);
              navigate.pop();
              renderStorages();
            })
            .catch((err) => {
              helpers.error(err);
              console.error(err);
            });
          break;

        case 'addFtp':
        case 'addSftp':
          if (action === 'addSftp') {
            localStorage.__fbAddSftp = true;

            if (IS_FREE_VERSION) {
              dialogs.alert(
                strings.info.toUpperCase(),
                strings['feature not available'],
                () => {
                  window.open(constants.PAID_VERSION, '_system');
                }
              );
              break;
            }
          }

          remoteStorage[action]()
            .then(updateStorage)
            .catch((err) => {
              if (err) console.error(err);
            });
          break;

        default:
          break;
      }
    };

    $search.onclick = function () {
      const $list = $content.get('#list');
      if ($list) searchBar($list);
    };

    $page.onhide = function () {
      actionStack.clearFromMark();
      actionStack.remove('filebrowser');
      $content.removeEventListener('click', handleClick);
      $content.removeEventListener('contextmenu', handleContextMenu);
      Acode.exec('check-files');
    };

    if (IS_FOLDER_MODE) {
      const openFolder = tag('button', {
        textContent: buttonText,
      });
      folderOption = tag('footer', {
        className: 'button-container',
        child: openFolder,
      });

      $page.setAttribute('footer-height', 1);
      $page.append(folderOption);

      openFolder.onclick = () => {
        $page.hide();
        resolve({
          type: 'folder',
          ...currentDir,
        });
      };
    }

    renderStorages();

    function renderStorages() {
      const storageList = [];

      if (!localStorage.fileBrowserInit || !allStorages.length) {
        fileBrowserOldState = [];
        recents.clear();
        dialogs.loader.destroy();

        allStorages.push({
          name: 'Acode',
          uuid: helpers.uuid(),
          uri: '',
        });

        new Promise((resolve, reject) => {
          if (IS_ANDROID_VERSION_5)
            resolve([
              {
                name: 'External storage',
                uuid: helpers.uuid(),
              },
            ]);
          else externalFs.listStorages().then(resolve).catch(reject);
        }).then((res) => {
          res.forEach((storage) => {
            if (allStorages.find((s) => s.uuid === storage.uuid)) return;
            allStorages.push({
              ...storage,
              uri: '',
              storageType: 'SD',
            });
          });
          saveStoragList();
          storageList.push(...getStorageList());
          renderStorages();
        });

        localStorage.fileBrowserInit = true;

        return;
      }

      if (!doesOpenLast) {
        fileBrowserOldState = [];
      }

      if (Array.isArray(defaultDir) && defaultDir.length) {
        fileBrowserOldState = [
          {
            name: '/',
            url: '/',
          },
          ...defaultDir,
        ];
      }

      if (fileBrowserOldState.length > 1) {
        loadUrl();
        return;
      }

      storageList.push(...getStorageList());
      renderList(storageList);
    }

    function loadUrl(states) {
      let state = states || fileBrowserOldState;
      let currUrl;
      if (!states) fileBrowserOldState = [];

      for (let i = 0; i < state.length; ++i) {
        const { url, name } = state[i];

        if (i)
          actionStack.push({
            id: currUrl,
            action,
          });

        if (i === state.length - 1) loadDir(url, name);
        else navigate(name, url);

        currUrl = url;
      }

      function action() {
        navigate.pop();
      }
    }

    function renderList(list) {
      if (IS_FOLDER_MODE) folderOption.classList.add('disabled');

      navigate('/', '/');
      currentDir.url = '/';
      currentDir.name = 'File Browser';
      $page.settitle = strings['file browser'];
      render(helpers.sortDir(list, appSettings.value.fileBrowser));
    }

    function resolve(data) {
      _resolve(data);
    }

    /**
     * @returns {PathData[]}
     */
    function getStorageList() {
      const list = [];

      allStorages.forEach((storage) => {
        util.pushFolder(list, storage.name, storage.uri, {
          storageType: storage.storageType,
          uuid: storage.uuid,
          home: storage.home,
        });
      });

      if (IS_FILE_MODE) {
        util.pushFolder(list, 'Select document', null, {
          'open-doc': true,
        });
      }

      cachedDir['/'] = {
        name: '/',
        list,
      };

      return list;
    }

    function loadDir(path = '/', name = strings['file browser']) {
      let url = path;

      if (typeof path === 'object') {
        url = path.url;
        name = path.name;
      }

      if (url === '/') return renderStorages();

      if (url in cachedDir) {
        update();
        const item = cachedDir[url];
        render(item.list);
        const $list = tag.get('#list');
        $list.scrollTop = item.scroll;
        name = item.name;
      } else {
        const timeout = setTimeout(() => {
          dialogs.loader.create('', strings.loading + '...');
        }, 100);
        fsOperation(url)
          .then((fs) => {
            return fs.lsDir();
          })
          .then((list) => {
            update();
            list = helpers.sortDir(
              list,
              appSettings.value.fileBrowser,
              testFileType,
              null,
              null,
              mode
            );
            cachedDir[url] = {
              name,
              list,
            };
            render(list);
          })
          .catch((err) => {
            actionStack.remove(currentDir.url);
            helpers.error(err, url);
            console.error(err);
          })
          .finally(() => {
            clearTimeout(timeout);
            dialogs.loader.destroy();
          });
      }

      function update() {
        if (url === root) {
          $addMenuToggler.classList.add('disabled');
          if (IS_FOLDER_MODE) folderOption.classList.add('disabled');
        } else {
          $addMenuToggler.classList.remove('disabled');
          if (IS_FOLDER_MODE) folderOption.classList.remove('disabled');
        }

        currentDir.url = url;
        currentDir.name = name;
        const $list = tag.get('#list');
        if ($list) $list.scrollTop = 0;
        navigate(name, url);
        $page.settitle = name;
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

      let url = window.atob($el.getAttribute('url') || '');
      let name = $el.getAttribute('name');
      const opendoc = $el.hasAttribute('open-doc');
      const uuid = $el.getAttribute('uuid');
      const type = $el.getAttribute('type');
      const storageType = $el.getAttribute('storageType');
      const home = $el.getAttribute('home');
      const isDir = ['dir', 'directory', 'folder'].includes(type);

      if (!url && action === 'open' && isDir && !opendoc && !contextMenu) {
        dialogs.loader.hide();
        util.addPath(name).then((res) => {
          const storage = allStorages.find((storage) => storage.uuid === uuid);
          storage.uri = res.uri;
          storage.name = res.name;
          name = res.name;
          saveStoragList();
          url = res.uri;
          folder();
        });
        return;
      }

      if (opendoc) action = 'open-doc';
      if (contextMenu) action = 'contextmenu';

      switch (action) {
        case 'navigation':
          folder();
          break;
        case 'contextmenu':
          cmhandle();
          break;
        case 'open':
          if (isDir) folder();
          else if (!$el.hasAttribute('disabled')) file();
          break;
        case 'open-doc':
          openDoc();
          break;
      }

      function folder() {
        if (home) {
          navigateToHome();
          return;
        }
        const $list = tag.get('#list');
        const currentUrl = currentDir.url;
        cachedDir[currentUrl].scroll = $list ? $list.scrollTop : 0;
        actionStack.push({
          id: currentUrl,
          action: function () {
            navigate.pop();
          },
        });
        loadDir(url, name);
      }

      function navigateToHome() {
        const navigations = [{ url: '/', name: '' }];
        const dirs = home.split('/');
        const { url: parsedUrl, query } = Url.parse(url);
        let path = '';

        for (let dir of dirs) {
          path = Url.join(path, dir);
          navigations.push({
            url: `${Url.join(parsedUrl, path, '')}${query}`,
            name: dir || name,
          });
        }

        loadUrl(navigations);
      }

      function file() {
        $page.hide();
        resolve({
          type: 'file',
          url,
          name,
        });
      }

      function cmhandle() {
        if (appSettings.value.vibrateOnTap) {
          navigator.vibrate(constants.VIBRATION_TIME);
        }
        if ($el.getAttribute('open-doc') === 'true') return;

        const options = [
          ['delete', strings.delete, 'delete'],
          ['rename', strings.rename, 'text_format'],
        ];

        if (/s?ftp/.test(storageType)) {
          options.push(['edit', strings.edit, 'edit']);
        }

        if (helpers.isFile(type)) {
          options.push(['info', strings.info, 'info']);
        }

        dialogs.select('', options).then((res) => {
          switch (res) {
            case 'delete':
              dialogs
                .confirm(
                  strings.warning.toUpperCase(),
                  strings['delete {name}'].replace('{name}', name)
                )
                .then(remove);
              break;
            case 'rename':
              dialogs
                .prompt(strings.rename, name, 'text', {
                  match: constants.FILE_NAME_REGEX,
                })
                .then((newname) => {
                  rename(newname);
                });
              break;

            case 'edit':
              remoteStorage
                .edit(allStorages.find((storage) => storage.uuid === uuid))
                .then((res) => {
                  updateStorage(res, uuid);
                })
                .catch((err) => {
                  if (err) console.error(err);
                });
              break;

            case 'info':
              Acode.exec('file-info', url);
              break;
          }
        });
      }

      function rename(newname) {
        if (uuid) {
          renameStorage(newname);
        } else {
          renameFile(newname);
        }
      }

      function remove() {
        if (uuid) {
          removeStorage();
        } else {
          removeFile();
        }
      }

      function renameFile(newname) {
        fsOperation(url)
          .then((fs) => {
            return fs.renameTo(newname);
          })
          .then((newUrl) => {
            openFolder.updateItem(url, newUrl, newname);
            toast(strings.success);
            delete cachedDir[currentDir.url];
            loadDir(currentDir);
          })
          .catch((err) => {
            helpers.error(err);
            console.error(err);
          });
      }

      function removeFile() {
        fsOperation(url)
          .then((fs) => {
            if (helpers.isFile(type)) return fs.deleteFile();
            if (helpers.isDir(type)) return fs.deleteDir();
          })
          .then(() => {
            recents.removeFile(url);
            if (helpers.isDir(type)) {
              recents.removeFolder(url);
              openFolder.removeItem(url);
              openFolder.removeFolders(url);
            }

            delete cachedDir[url];
            delete cachedDir[currentDir.url];
            loadDir(currentDir);
            toast(strings.success);
          })
          .catch((err) => {
            console.error(err);
            helpers.error(err);
          });
      }

      function removeStorage() {
        if (url) {
          recents.removeFolder(url);
          recents.removeFiles(url);
        }
        allStorages = allStorages.filter((storage) => {
          if (storage.uuid !== uuid) {
            return true;
          }

          if (storage.uri) {
            const parsedUrl = URLParse(storage.uri, true);
            const keyFile = decodeURIComponent(
              parsedUrl.query['keyFile'] || ''
            );
            if (keyFile) {
              fsOperation(keyFile).then((fs) => {
                fs.deleteFile();
              });
            }
          }
          return false;
        });
        localStorage.storageList = JSON.stringify(allStorages);
        navigate.pop();
        renderStorages();
      }

      function renameStorage(newname) {
        allStorages = allStorages.map((storage) => {
          if (storage.uuid === uuid) storage.name = newname;
          return storage;
        });
        localStorage.storageList = JSON.stringify(allStorages);
        navigate.pop();
        renderStorages();
      }

      function openDoc() {
        sdcard.openDocumentFile(
          (res) => {
            res.url = res.uri;
            resolve({
              type: 'file',
              ...res,
              name: res.filename,
              mode: 'single',
            });
            $page.hide();
          },
          (err) => {
            helpers.error(err);
            console.error(err);
          }
        );
      }
    }

    function handleContextMenu(e) {
      handleClick(e, true);
    }

    function refresh() {
      cachedDir = {};
      loadDir(currentDir.url, currentDir.name);
    }

    function render(list) {
      const $list = tag.parse(
        mustache.render(_list, {
          msg: strings['empty folder message'],
          list,
        })
      );

      const $oldList = $content.querySelector('#list');
      if ($oldList) $oldList.remove();
      $content.append($list);
      $list.focus();

      //Adding notication icon to let user know about new feature
      if (currentDir.url === '/') {
        const addButtonNotice =
          !localStorage.__fbAddPath || !localStorage.__fbAddSftp;

        if (!localStorage.__fbHelp) {
          $menuToggler.classList.add('notice');
        }
        if (addButtonNotice) {
          $addMenuToggler.classList.add('notice');
        }
      } else {
        $menuToggler.classList.remove('notice');
        $addMenuToggler.classList.remove('notice');
      }
    }
    function navigate(name, url) {
      let $nav = $navigation.querySelector(`[url="${window.btoa(url)}"]`);
      const $old = $navigation.querySelector('.active');
      if ($old) $old.classList.remove('active');

      //If navigate to previous directories, clear the rest navigation
      if ($nav) {
        let $topNav;
        while (($topNav = $navigation.lastChild) !== $nav) {
          const url = window.atob($topNav.getAttribute('url'));
          actionStack.remove(url);
          $topNav.remove();
        }

        while ((fileBrowserState.slice(-1)[0] || { url }).url !== url) {
          fileBrowserState.pop();
        }

        localStorage.fileBrowserState = JSON.stringify(fileBrowserState);
        actionStack.remove(url);
        return $nav.classList.add('active');
      }

      if (name && doesOpenLast) {
        fileBrowserState.push({
          name,
          url,
        });
        localStorage.fileBrowserState = JSON.stringify(fileBrowserState);
      }

      $nav = tag('span', {
        className: 'nav active',
        attr: {
          action: 'navigation',
          url: window.btoa(url || ''),
          text: name,
          name,
        },
        tabIndex: -1,
      });

      $navigation.append($nav);
      $navigation.scrollLeft = $navigation.scrollWidth;
    }

    navigate.pop = function () {
      if (doesOpenLast) {
        fileBrowserState.pop();
        localStorage.fileBrowserState = JSON.stringify(fileBrowserState);
      }
      const $nav = $navigation.lastChild.previousElementSibling;
      if ($nav) {
        const url = window.atob($nav.getAttribute('url'));
        const name = $nav.getAttribute('name');
        navigate(name, url);
        loadDir(url, name);
      }
    };

    function updateAddedFolder(url) {
      if (cachedDir[url]) delete cachedDir[url];
      if (cachedDir[currentDir.url]) delete cachedDir[currentDir.url];

      const regex = new RegExp(Url.parse(url).url);

      for (let folder of addedFolder) {
        if (folder.url === url) {
          folder.remove();
        } else if (regex.test(currentDir.url)) {
          folder.reload();
        }
      }
    }

    /**
     *
     * @param {"file"|"folder"|"project"} arg
     */
    function create(arg) {
      const { url, name } = currentDir;
      const alreadyCreated = [];
      const options = [];
      let cturl = '';
      let newUrl = null;
      let project = '';
      let projectName = '';
      let framework = '';

      if (arg === 'file' || arg === 'folder') {
        let title = strings['enter folder name'];
        let val = strings['new folder'];
        if (arg === 'file') {
          title = strings['enter file name'];
          val = 'untitled.txt';
        }
        prompt(title, val, 'filename', {
          match: constants.FILE_NAME_REGEX,
          required: true,
        }).then((entryName) => {
          if (!entryName) return;
          entryName = helpers.removeLineBreaks(entryName);

          fsOperation(url)
            .then((fs) => {
              if (arg === 'folder') return fs.createDirectory(entryName);
              if (arg === 'file') return fs.createFile(entryName);
            })
            .then((res) => {
              updateAddedFolder(url);
              toast(strings.success);
              loadDir(url, name);
            })
            .catch((e) => {
              helpers.error(e);
              console.error(e);
            });
        });

        return;
      }

      if (arg === 'project') {
        /**
         * Initiating project options
         */
        Object.keys(projects).map((projectname) => {
          options.push([projectname, projectname, 'icon ' + projectname]);
        });

        dialogs
          .select(strings['new project'], options) // Selecting project from optioins
          .then((res) => {
            framework = res;
            dialogs.loader.create(res, strings.loading + '...');
            return projects[res](); //getting selected project
          })
          .then((res) => {
            dialogs.loader.destroy();
            project = res.default;
            return dialogs.prompt(strings['project name'], framework, 'text', {
              required: true,
              match: constants.FILE_NAME_REGEX,
            }); // Asking for project name
          })
          .then((name) => {
            projectName = name;
            return fsOperation(url); // Getting file system for given url (Active directory)
          })
          .then((fs) => {
            dialogs.loader.create(projectName, strings.loading + '...');
            return fs.createDirectory(projectName); // Creating project root directory
          })
          .then((res) => {
            newUrl = Url.join(url, projectName, '/'); // CD to project directory
            const files = Object.keys(project); // All project files

            return new Promise((resolve, reject) => {
              createProject(resolve, reject, files); // Creating project
            });
          })
          .catch((err) => {
            helpers.error(err);
            console.error(err);
          })
          .finally(() => {
            dialogs.loader.destroy();
          });
      }

      function createProject(resolve, reject, files) {
        if (!files.length) {
          // checking if it's the last file
          updateAddedFolder(url);
          toast(strings.success); // notifies when project is created
          loadDir(url, name); // reload the current directory
          resolve();
        }
        cturl = '';
        const file = files.pop();
        createFile(file)
          .then(() => {
            createProject(resolve, reject, files);
          })
          .catch(reject);
      }

      function createFile(fileurl) {
        const paths = fileurl.split('/');
        const filename = paths.pop();

        return new Promise((resolve, reject) => {
          createDir(resolve, reject, project, fileurl, filename, paths);
        });
      }

      function createDir(resolve, reject, project, fileurl, filename, paths) {
        const lclUrl = Url.join(newUrl, cturl);

        if (paths.length === 0) {
          return fsOperation(lclUrl)
            .then((fs) => {
              const data = project[fileurl].replace(/<%name%>/g, projectName);
              return fs.createFile(filename, data);
            })
            .then(resolve)
            .catch(reject);
        }

        const name = paths.splice(0, 1)[0];
        const toCreate = Url.join(lclUrl, name);

        fsOperation(lclUrl)
          .then((fs) => {
            if (alreadyCreated.includes(toCreate)) return Promise.resolve();
            return fs.createDirectory(name);
          })
          .then((res) => {
            if (!alreadyCreated.includes(toCreate))
              alreadyCreated.push(toCreate);
            cturl += name + '/';
            return createDir(
              resolve,
              reject,
              project,
              fileurl,
              filename,
              paths
            );
          })
          .catch(reject);
      }
    }

    function testFileType(uri) {
      const ext = helpers.extname(uri);

      if (
        appSettings.defaultSettings.filesNotAllowed.includes(
          (ext || '').toLowerCase()
        )
      ) {
        return false;
      }
      return true;
    }

    function updateStorage(storage, uuid) {
      if (uuid) {
        allStorages = allStorages.filter((storage) => storage.uuid !== uuid);
      } else {
        uuid = helpers.uuid();
      }

      allStorages.push({
        name: storage.alias,
        uri: storage.url,
        home: storage.home,
        uuid,
        storageType: storage.type,
        type: 'dir',
      });
      localStorage.storageList = JSON.stringify(allStorages);
      navigate.pop();
      renderStorages();
    }
  });
}

export default FileBrowserInclude;
