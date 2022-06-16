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
 * @typedef {{url: String, name: String}} Location
 */

/**
 * @typedef Storage
 * @property {String} name
 * @property {String} uuid
 * @property {String} url
 * @property {'dir'} type
 * @property {'permission'|'ftp'|'sftp'|'sd'} storageType
 */

/**
 *
 * @param {import('./fileBrowser').BrowseMode} [mode='file']
 * @param {function(string):boolean} [buttonText] button text or function to check extension
 * @param {string} [info]
 * @param {boolean} [doesOpenLast]
 * @returns {Promise<import('./fileBrowser').SelectedFile>}
 */
function FileBrowserInclude(mode, info, buttonText, doesOpenLast = true) {
  mode = mode || 'file';

  const IS_FOLDER_MODE = ['folder', 'both'].includes(mode);
  const IS_FILE_MODE = ['file', 'both'].includes(mode);
  const storedState = helpers.parseJSON(localStorage.fileBrowserState) || [];
  /**@type {Array<Location>} */
  const state = [];
  /**@type {Array<Storage>} */
  const allStorages = [];
  let storageList = JSON.parse(localStorage.storageList || '[]');

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
      }),
    );
    const $navigation = $content.get('.navigation');
    const menuOption = {
      top: '8px',
      right: '8px',
      toggle: $menuToggler,
      transformOrigin: 'top right',
    };
    const $fbMenu = contextMenu({
      innerHTML: () => {
        return `
        <li action="settings">${strings.settings.capitalize(0)}</li>
        ${currentDir.url === '/' ? `<li action="refresh">${strings['reset connections'].capitalize(0)}</li>` : ''}
        <li action="reload">${strings.reload.capitalize(0)}</li>
        `;
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
    const progress = {};
    let cachedDir = {};
    let currentDir = {
      url: null,
      name: null,
      list: [],
      scroll: 0,
    };
    /**
     * @type {HTMLButtonElement}
     */
    let $openFolder;
    //#endregion

    actionStack.setMark();
    $lead.onclick = $page.hide;
    $content.addEventListener('click', handleClick);
    $content.addEventListener('contextmenu', handleContextMenu);
    $page.append($content);
    $page.get('header').append($search, $addMenuToggler, $menuToggler);


    if (IS_FOLDER_MODE) {
      $openFolder = tag('button', {
        className: 'floating icon check',
        style: {
          bottom: '10px',
          top: 'unset',
        },
        disabled: true,
        onclick() {
          $page.hide();
          resolve({
            type: 'folder',
            ...currentDir,
          });
        },
      });

      $page.append($openFolder);
    }

    app.append($page);
    helpers.showAd();

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
        const { url } = currentDir;
        if (url in cachedDir) delete cachedDir[url];
        reload();
        return;
      }

      if (action === 'refresh') {
        ftp.disconnect(
          () => { },
          () => { },
        );
        sftp.close(
          () => { },
          () => { },
        );
        toast(strings.success);
        return;
      }

      checkAndSetNotification();
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
          addStorage();
          break;

        case 'addFtp':
        case 'addSftp':
          if (action === 'addSftp') {
            localStorage.__fbAddSftp = true;
          }

          remoteStorage[action]()
            .then((storage) => {
              updateStorage(storage);
            })
            .catch((err) => {
              if (err) console.error(err);
            });
          break;

        default:
          break;
      }

      checkAndSetNotification();
    };

    $search.onclick = function () {
      const $list = $content.get('#list');
      if ($list) searchBar($list);
    };

    $page.onhide = function () {
      helpers.hideAd();
      actionStack.clearFromMark();
      actionStack.remove('filebrowser');
      $content.removeEventListener('click', handleClick);
      $content.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('resume', reload);
    };

    if (doesOpenLast && storedState.length) {
      loadStates(storedState);
      return;
    }
    navigate('/', '/');

    /**
     * Called when any file folder is clicked
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
      let name = $el.data_name || $el.getAttribute('name');
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

      if (storageType === 'notification') {
        switch (uuid) {
          case 'addstorage':
            addStorage();
            break;

          default:
            break;
        }
        return;
      }

      if (!url && action === 'open' && isDir && !opendoc && !isContextMenu) {
        dialogs.loader.hide();
        util.addPath(name, uuid).then((res) => {
          const storage = allStorages.find((storage) => storage.uuid === uuid);
          storage.url = res.uri;
          storage.name = res.name;
          name = res.name;
          updateStorage(storage, false);
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
          cmhandler();
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
        navigate(url, name);
      }

      function navigateToHome() {
        const navigations = [];
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

        loadStates(navigations);
      }

      function file() {
        $page.hide();
        resolve({
          type: 'file',
          url,
          name,
        });
      }

      function cmhandler() {
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
                  strings['delete {name}'].replace('{name}', name),
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
                .then((storage) => {
                  if (storage) {
                    storage.uuid = uuid;
                    updateStorage(storage);
                  }
                })
                .catch((err) => {
                  if (err) console.error(err);
                });
              break;

            case 'info':
              acode.exec('file-info', url);
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
        }
      }

      async function removeFile() {
        try {
          const fs = fsOperation(url);
          await fs.delete();
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
              parsedUrl.query['keyFile'] || '',
            );
            if (keyFile) {
              fsOperation(keyFile).delete();
            }
          }
          return false;
        });
        localStorage.storageList = JSON.stringify(storageList);
        reload();
      }

      function renameStorage(newname) {
        storageList = storageList.map((storage) => {
          if (storage.uuid === uuid) storage.name = newname;
          return storage;
        });
        localStorage.storageList = JSON.stringify(storageList);
        reload();
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
          },
        );
      }
    }

    function handleContextMenu(e) {
      handleClick(e, true);
    }

    function checkAndSetNotification() {
      const addButtonNotice = !localStorage.__fbAddPath || !localStorage.__fbAddSftp;

      if (addButtonNotice) {
        $addMenuToggler.classList.add('notice');
      } else {
        $addMenuToggler.classList.remove('notice');
      }
    }

    async function listAllStorages() {
      let hasInternalStorage = true;
      allStorages.length = 0;

      if (ANDROID_SDK_INT == 29) {
        const rootDirName = cordova.file.externalRootDirectory;
        const testDirName = 'Acode_Test_file' + helpers.uuid();
        const testDirFs = fsOperation(Url.join(rootDirName, testDirName));

        try {
          await fsOperation(rootDirName).createDirectory(testDirName);
          await testDirFs.createFile('test' + helpers.uuid());

          hasInternalStorage = !!(await testDirFs.lsDir()).length;
        } catch (error) {
          console.error(error);
        } finally {
          testDirFs.delete();
        }
      } else if (ANDROID_SDK_INT > 29) {
        hasInternalStorage = false;
      }

      if (hasInternalStorage) {
        util.pushFolder(
          allStorages,
          'Internal storage',
          cordova.file.externalRootDirectory,
          {
            uuid: 'internal-storage',
          },
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
            storageType: 'sd',
          });
        });
      } catch (err) { }

      storageList.forEach((storage) => {
        let url = storage.url || /**@drepreceted */ storage['uri'];

        util.pushFolder(allStorages, storage.name, url, {
          storageType: storage.storageType,
          uuid: storage.uuid,
          home: storage.home,
        });
      });

      if (!allStorages.length) {
        util.pushFolder(allStorages, strings['add a storage'], '', {
          storageType: 'notification',
          uuid: 'addstorage',
        });
      }

      if (IS_FILE_MODE) {
        util.pushFolder(allStorages, 'Select document', null, {
          'open-doc': true,
        });
      }

      return allStorages;
    }

    /**
     * Gets directory for given url for rendering
     * @param {String} url
     * @param {String} name
     * @returns {Promise<{name: String, url: String, list: [], scroll: Number}>}
     */
    async function getDir(url, name) {
      const { fileBrowser } = appSettings.value;
      let list = null;
      let error = false;

      if (url in cachedDir) {
        return cachedDir[url];
      } else {
        if (url === '/') {
          list = await listAllStorages();
        } else {
          const id = helpers.uuid();

          progress[id] = true;
          const timeout = setTimeout(() => {
            dialogs.loader.create(name, strings.loading + '...', {
              timeout: 10000,
              callback() {
                dialogs.loader.destroy();
                navigate('/', '/');
                progress[id] = false;
              },
            });
          }, 100);

          const fs = fsOperation(url);
          try {
            list = await fs.lsDir();
          } catch (err) {
            if (progress[id]) {
              helpers.error(err, url);
            } else {
              console.error(err);
            }
          }

          error = !progress[id];

          delete progress[id];
          clearTimeout(timeout);
          dialogs.loader.destroy();
        }
        if (error) return null;
        return {
          url,
          name,
          scroll: 0,
          list: helpers.sortDir(list, fileBrowser, testFileType, mode),
        };
      }
    }

    /**
     * Navigates to specific directory
     * @param {String} url
     * @param {String} name
     */
    async function navigate(url, name, assignBackButton = true) {
      if (!url) {
        throw new Error('navigate(url, name): "url" is required.');
      }

      if (!name) {
        throw new Error('navigate(url, name): "name" is required.');
      }

      if (url === '/') {
        if (IS_FOLDER_MODE) $openFolder.disabled = true;
      } else {
        if (IS_FOLDER_MODE) $openFolder.disabled = false;
      }

      const $nav = tag.get(`#${getNavId(url)}`);

      //If navigate to previous directories, clear the rest navigation
      if ($nav) {
        let $topNav;
        while (($topNav = $navigation.lastChild) !== $nav) {
          const url = $topNav.data_url;
          actionStack.remove(url);
          $topNav.remove();
        }

        while (1) {
          const location = state.slice(-1)[0];
          if (!location || location.url === url) break;
          state.pop();
        }
        localStorage.fileBrowserState = JSON.stringify(state);

        const dir = await getDir(url, name);
        if (dir) {
          render(dir);
        }
        return;
      }

      const dir = await getDir(url, name);
      if (dir) {
        const { url: curl, name: cname } = currentDir;
        let action;
        if (doesOpenLast) pushState({ name, url });
        if (curl && cname && assignBackButton) {
          action = () => {
            navigate(curl, cname, false);
          };
        }
        pushToNavbar(name, url, action);
        render(dir);
      }
    }

    /**
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

        let entryName = await dialogs.prompt(title, val, 'filename', {
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
          },
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

    /**
     *  Pushes a navigation button to navbar
     * @param {String} id
     * @param {String} name
     * @param {String} url
     */
    function pushToNavbar(name, url, action) {
      $navigation.append(
        tag('span', {
          id: getNavId(url),
          className: 'nav',
          data_url: url,
          data_name: name,
          attr: {
            action: 'navigation',
            text: name,
          },
          tabIndex: -1,
        }),
      );
      $navigation.scrollLeft = $navigation.scrollWidth;

      if (action && !actionStack.has(url)) {
        actionStack.push({
          id: url,
          action,
        });
      }
    }

    /**
     * Loads up given states
     * @param {Array<Location>} states
     */
    function loadStates(states) {
      if (!Array.isArray(states)) return;

      const backNavigation = [];
      const { url, name } = states.pop();
      let { url: lastUrl, name: lastName } = currentDir;

      while (states.length) {
        const location = states.splice(0, 1)[0];
        const { url, name } = location;
        let action;

        if (doesOpenLast) pushState({ name, url });
        if (lastUrl && lastName) {
          backNavigation.push([lastUrl, lastName]);
          action = () => {
            const [url, name] = backNavigation.pop();
            navigate(url, name, false);
          };
        }
        pushToNavbar(name, url, action);
        lastUrl = url;
        lastName = name;
      }

      currentDir = { url: lastUrl, name: lastName };
      navigate(url, name);
    }

    /**
     *
     * @param {String} url
     */
    function getNavId(url) {
      return `nav_${url.hashCode()}`;
    }

    /**
     * Updates folders that are added in sidebar
     * @param {String} url
     */
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
     * Check if file is allowed or not and returns `true` if allowed
     * else returns `false`.
     * @param {String} uri
     * @returns
     */
    function testFileType(uri) {
      const ext = helpers.extname(uri);

      if (
        appSettings.value.filesNotAllowed.includes((ext || '').toLowerCase())
      ) {
        return false;
      }
      return true;
    }

    /**
     *
     * @param {Storage} storage
     * @param {Boolean} doesRleoad
     */
    function updateStorage(storage, doesRleoad = true) {
      if (storage.uuid) {
        storageList = storageList.filter((s) => s.uuid !== storage.uuid);
      } else {
        storage.uuid = helpers.uuid();
      }

      if (!storage.type) {
        storage.type = 'dir';
      }

      if (!storage.storageType) {
        storage.storageType = storage.type;
      }

      storageList.push(storage);
      localStorage.storageList = JSON.stringify(storageList);
      if (doesRleoad) reload();
    }

    function render(dir) {
      const { list, scroll } = dir;
      const $list = tag.parse(
        mustache.render(_list, {
          msg: strings['empty folder message'],
          list,
        }),
      );

      const $oldList = $content.get('#list');
      if ($oldList) {
        const { url } = currentDir;
        if (url && cachedDir[url]) {
          cachedDir[url].scroll = $oldList.scrollTop;
        }
        $oldList.remove();
      }
      $content.append($list);
      $list.scrollTop = scroll;
      $list.focus();

      //Adding notification to icon to let user know about new feature
      if (dir.url === '/') {
        checkAndSetNotification();
      } else {
        $menuToggler.classList.remove('notice');
        $addMenuToggler.classList.remove('notice');
      }

      currentDir = dir;
      cachedDir[dir.url] = dir;
    }

    function reload() {
      const { url, name } = currentDir;
      delete cachedDir[url];
      navigate(url, name);
    }

    function pushState({ url, name }) {
      if (!url || !name) return;
      if (state.find((l) => l.url === url)) return;
      state.push({ url, name });
      localStorage.fileBrowserState = JSON.stringify(state);
    }

    /**
     * Adds a new storage and refresh location
     */
    function addStorage() {
      util
        .addPath()
        .then((res) => {
          storageList.push(res);
          localStorage.storageList = JSON.stringify(storageList);
          reload();
        })
        .catch((err) => {
          helpers.error(err);
        });
    }
  });
}

export default FileBrowserInclude;
