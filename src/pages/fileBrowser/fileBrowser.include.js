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
  doesOpenLast = true
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
  /**@type {Array<{name: string, uuid: string, url: string, home: String, storageType: String}>} */
  let storageList = JSON.parse(localStorage.storageList || '[]');
  const allStorages = [];
  const updateStorageList = (storage) => {
    if (!storage.uuid) return;
    storageList = storageList.filter((s) => s.uuid !== storage.uuid);
    storageList.push(storage);
    localStorage.storageList = JSON.stringify(storageList);
  };

  if (!info) {
    if (mode !== 'both') {
      info = IS_FOLDER_MODE ? strings['open folder'] : strings['open file'];
    } else {
      info = strings['file browser'];
    }
  }

  return new Promise((resolve, reject) => {
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
        return `<li action="settings">${strings.settings.capitalize(
          0
        )}</li><li action="reload">${strings.reload.capitalize(0)}</li>`;
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
    const progress = {};
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
    $page.get('header').append($search, $addMenuToggler, $menuToggler);
    app.append($page);

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
        filesSettings(reload);
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
              storageList.push(res);
              localStorage.storageList = JSON.stringify(storageList);
              navigationPop();
              listAllStorages();
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
      document.removeEventListener('resume', reload);
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

    if (doesOpenLast && fileBrowserOldState.length) {
      navigate(fileBrowserOldState);
      return;
    }
    listAllStorages();

    async function listAllStorages() {
      if (IS_FOLDER_MODE) folderOption.classList.add('disabled');
      allStorages.length = 0;
      let isStorageManager = await new Promise((resolve, reject) => {
        system.isExternalStorageManager(resolve, reject);
      });

      if (!isStorageManager && ANDROID_SDK_INT >= 30) {
        util.pushFolder(allStorages, 'Allow Acode to manage all files', '', {
          storageType: 'permission',
          uuid: 'permission',
        });
      }

      if (ANDROID_SDK_INT <= 29 || isStorageManager) {
        util.pushFolder(
          allStorages,
          'Internal storage',
          cordova.file.externalRootDirectory,
          {
            storageType: 'SD',
            uuid: 'internal-storage',
          }
        );
      }

      try {
        const res = await externalFs.listStorages();
        res.forEach((storage) => {
          if (storageList.find((s) => s.uuid === storage.uuid)) return;
          let path;
          if (storage.path && isStorageManager) {
            path = 'file://' + storage.path;
          }
          util.pushFolder(allStorages, storage.name, path || '', {
            ...storage,
            storageType: 'SD',
          });
        });
      } catch (err) {}

      storageList.forEach((storage) => {
        let url = storage.url || /**@drepreceted */ storage['uri'];

        util.pushFolder(allStorages, storage.name, url, {
          storageType: storage.storageType,
          uuid: storage.uuid,
          home: storage.home,
        });
      });

      if (IS_FILE_MODE) {
        util.pushFolder(allStorages, 'Select document', null, {
          'open-doc': true,
        });
      }

      cachedDir['/'] = {
        name: '/',
        list: allStorages,
      };

      navigationPush('/', '/');
      currentDir.url = '/';
      currentDir.name = 'File Browser';
      $page.settitle(strings['file browser']);
      render(helpers.sortDir(allStorages, appSettings.value.fileBrowser));
    }

    async function loadDir(url = '/', name = strings['file browser']) {
      const id = helpers.uuid();
      progress[id] = true;

      if (url === '/') return listAllStorages();

      if (url in cachedDir) {
        update();
        const item = cachedDir[url];
        render(item.list);
        const $list = tag.get('#list');
        $list.scrollTop = item.scroll;
        name = item.name;
      } else {
        const timeout = setTimeout(() => {
          dialogs.loader.create(name, strings.loading + '...', {
            timeout: 10000,
            callback() {
              dialogs.loader.destroy();
              navigationPush('/', '/');
              progress[id] = false;
            },
          });
        }, 100);

        try {
          const { fileBrowser } = appSettings.value;
          const fs = fsOperation(url);
          let list = await fs.lsDir();

          if (!progress[id]) {
            delete progress[id];
            return;
          }

          delete progress[id];
          list = helpers.sortDir(
            list,
            fileBrowser,
            testFileType,
            null,
            null,
            mode
          );
          cachedDir[url] = {
            name,
            list,
          };
          update();
          render(list);
        } catch (err) {
          if (!progress[id]) {
            delete progress[id];
            return;
          }

          actionStack.remove(currentDir.url);
          helpers.error(err, url);
          console.error(err);
        }

        clearTimeout(timeout);
        dialogs.loader.destroy();
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
        navigationPush(name, url);
        $page.settitle(name);
      }
    }

    /**
     *
     * @param {MouseEvent} e
     * @param {"contextmenu"} [isContextMenu]
     */
    function handleClick(e, isContextMenu) {
      /**
       * @type {HTMLElement}
       */
      const $el = e.target;
      let action = $el.getAttribute('action');
      if (!action) return;

      let url = $el.data_url;
      let name = $el.getAttribute('name');
      const opendoc = $el.hasAttribute('open-doc');
      const uuid = $el.getAttribute('uuid');
      const type = $el.getAttribute('type');
      const storageType = $el.getAttribute('storageType');
      const home = $el.getAttribute('home');
      const isDir = ['dir', 'directory', 'folder'].includes(type);

      if (!url) {
        const $url = $el.get('data-url');
        if ($url) {
          url = $url.textContent;
        }
      }

      if (storageType === 'permission') {
        dialogs
          .confirm(strings.info.toUpperCase(), strings['manage all files'])
          .then(() => {
            document.addEventListener('resume', reload);
            system.manageAllFiles();
          });
        return;
      }

      if (!url && action === 'open' && isDir && !opendoc && !isContextMenu) {
        dialogs.loader.hide();
        util.addPath(name, uuid).then((res) => {
          const storage = allStorages.find((storage) => storage.uuid === uuid);
          storage.url = res.uri;
          storage.name = res.name;
          name = res.name;
          updateStorageList(storage);
          url = res.uri;
          folder();
        });
        return;
      }

      if (opendoc) action = 'open-doc';
      if (isContextMenu) action = 'contextmenu';

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
            navigationPop();
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

        navigate(navigations);
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
                .edit(storageList.find((storage) => storage.uuid === uuid))
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

      async function renameFile(newname) {
        const fs = fsOperation(url);
        try {
          const newUrl = await fs.renameTo(newname);
          openFolder.updateItem(url, newUrl, newname);
          toast(strings.success);
          reload();
        } catch (err) {
          helpers.error(err);
          console.error(err);
        }
      }

      async function removeFile() {
        try {
          const fs = fsOperation(url);
          if (helpers.isFile(type)) await fs.deleteFile();
          if (helpers.isDir(type)) await fs.deleteDir();
          recents.removeFile(url);
          if (helpers.isDir(type)) {
            helpers.updateUriOfAllActiveFiles(url);
            recents.removeFolder(url);
            openFolder.removeItem(url);
            openFolder.removeFolders(url);
          } else {
            const openedFile = editorManager.getFile(url, 'uri');
            if (openedFile) openedFile.uri = null;
          }
          delete cachedDir[url];
          reload();
          toast(strings.success);
        } catch (err) {
          console.error(err);
          helpers.error(err);
        }
      }

      function removeStorage() {
        if (url) {
          recents.removeFolder(url);
          recents.removeFile(url);
        }
        storageList = storageList.filter((storage) => {
          if (storage.uuid !== uuid) {
            return true;
          }

          if (storage.url) {
            const parsedUrl = URLParse(storage.url, true);
            const keyFile = decodeURIComponent(
              parsedUrl.query['keyFile'] || ''
            );
            if (keyFile) {
              fsOperation(keyFile).deleteFile();
            }
          }
          return false;
        });
        localStorage.storageList = JSON.stringify(storageList);
        navigationPop();
        listAllStorages();
      }

      function renameStorage(newname) {
        storageList = storageList.map((storage) => {
          if (storage.uuid === uuid) storage.name = newname;
          return storage;
        });
        localStorage.storageList = JSON.stringify(storageList);
        navigationPop();
        listAllStorages();
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

      //Adding notification to icon to let user know about new feature
      if (currentDir.url === '/') {
        const addButtonNotice =
          !localStorage.__fbAddPath || !localStorage.__fbAddSftp;

        if (addButtonNotice) {
          $addMenuToggler.classList.add('notice');
        }
      } else {
        $menuToggler.classList.remove('notice');
        $addMenuToggler.classList.remove('notice');
      }
    }

    function navigate(states) {
      if (!Array.isArray(states)) return;
      let currUrl;

      for (let i = 0; i < states.length; ++i) {
        const { url, name } = states[i];
        if (i > 0) {
          actionStack.push({
            id: currUrl,
            action: navigationPop,
          });
        }

        if (i === states.length - 1) loadDir(url, name);
        else navigationPush(name, url);

        currUrl = url;
      }
    }

    function navigationPush(name, url) {
      const id = `nav_${url.hashCode()}`;
      const $old = $navigation.querySelector('.active');
      let $nav = tag.get(`#${id}`);

      if ($old) $old.classList.remove('active');

      //If navigate to previous directories, clear the rest navigation
      if ($nav) {
        let $topNav;
        while (($topNav = $navigation.lastChild) !== $nav) {
          const url = $topNav.getAttribute('url');
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
        id: `${id}`,
        data_url: url,
        data_name: name,
        attr: {
          action: 'navigation',
          text: name,
        },
        tabIndex: -1,
      });

      $navigation.append($nav);
      $navigation.scrollLeft = $navigation.scrollWidth;
    }

    function navigationPop() {
      if (doesOpenLast) {
        fileBrowserState.pop();
        localStorage.fileBrowserState = JSON.stringify(fileBrowserState);
      }
      const $nav = $navigation.lastChild.previousElementSibling;
      if ($nav) {
        const url = $nav.data_url;
        const name = $nav.data_name;
        navigationPush(name, url);
        loadDir(url, name);
      }
    }

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
    async function create(arg) {
      const { url } = currentDir;
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

        let entryName = await prompt(title, val, 'filename', {
          match: constants.FILE_NAME_REGEX,
          required: true,
        });

        if (!entryName) return;
        entryName = helpers.removeLineBreaks(entryName);

        try {
          const fs = fsOperation(url);
          if (arg === 'folder') await fs.createDirectory(entryName);
          if (arg === 'file') await fs.createFile(entryName);
          updateAddedFolder(url);
          reload();
        } catch (err) {
          helpers.error(err);
          console.error(err);
        }

        return;
      }

      if (arg === 'project') {
        /**
         * Initiating project options
         */
        Object.keys(projects).map((projectname) => {
          options.push([projectname, projectname, 'icon ' + projectname]);
        });

        framework = await dialogs.select(strings['new project'], options);
        dialogs.loader.create(framework, strings.loading + '...');
        project = (await projects[framework]()).default;
        dialogs.loader.destroy();
        projectName = await dialogs.prompt(
          strings['project name'],
          framework,
          'text',
          {
            required: true,
            match: constants.FILE_NAME_REGEX,
          }
        );

        try {
          const fs = fsOperation(url);
          dialogs.loader.create(projectName, strings.loading + '...');
          await fs.createDirectory(projectName);
          newUrl = Url.join(url, projectName, '/');
          const files = Object.keys(project); // All project files
          await createProject(files); // Creating project
        } catch (err) {
          helpers.error(err);
          console.error(err);
        }

        dialogs.loader.destroy();
      }

      async function createProject(files) {
        // checking if it's the last file
        if (!files.length) {
          updateAddedFolder(url);
          reload();
          return;
        }
        cturl = '';
        const file = files.pop();
        await createFile(file);
        return await createProject(files);
      }

      function createFile(fileurl) {
        const paths = fileurl.split('/');
        const filename = paths.pop();
        return createDir(project, fileurl, filename, paths);
      }

      async function createDir(project, fileurl, filename, paths) {
        const lclUrl = Url.join(newUrl, cturl);
        const fs = fsOperation(lclUrl);

        if (paths.length === 0) {
          const data = project[fileurl].replace(/<%name%>/g, projectName);
          await fs.createFile(filename, data);
          return;
        }

        const name = paths.splice(0, 1)[0];
        const toCreate = Url.join(lclUrl, name);
        if (!alreadyCreated.includes(toCreate)) {
          await fs.createDirectory(name);
          alreadyCreated.push(toCreate);
        }
        cturl += name + '/';
        return await createDir(project, fileurl, filename, paths);
      }
    }

    function testFileType(uri) {
      const ext = helpers.extname(uri);

      if (
        appSettings.value.filesNotAllowed.includes((ext || '').toLowerCase())
      ) {
        return false;
      }
      return true;
    }

    function updateStorage(storage, uuid) {
      if (uuid) {
        storageList = storageList.filter((storage) => storage.uuid !== uuid);
      } else {
        uuid = helpers.uuid();
      }

      storageList.push({
        name: storage.alias,
        uri: storage.url,
        home: storage.home,
        uuid,
        storageType: storage.type,
        type: 'dir',
      });
      localStorage.storageList = JSON.stringify(storageList);
      navigationPop();
      listAllStorages();
    }

    function reload() {
      const { url, name } = currentDir;
      delete cachedDir[url];
      loadDir(url, name);
    }
  });
}

export default FileBrowserInclude;
