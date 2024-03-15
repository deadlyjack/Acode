import './fileBrowser.scss';

import mustache from 'mustache';
import Page from 'components/page';
import helpers from 'utils/helpers';
import Contextmenu from 'components/contextmenu';
import constants from 'lib/constants';
import filesSettings from 'settings/filesSettings';
import _template from './fileBrowser.hbs';
import _list from './list.hbs';
import _addMenu from './add-menu.hbs';
import _addMenuHome from './add-menu-home.hbs';
import externalFs from 'fileSystem/externalFs';
import fsOperation from 'fileSystem';
import searchBar from 'components/searchbar';
import Url from 'utils/Url';
import util from './util';
import openFolder from 'lib/openFolder';
import recents from 'lib/recents';
import remoteStorage from 'lib/remoteStorage';
import URLParse from 'url-parse';
import checkFiles from 'lib/checkFiles';
import projects from 'lib/projects';
import appSettings from 'lib/settings';
import loader from 'dialogs/loader';
import select from 'dialogs/select';
import confirm from 'dialogs/confirm';
import prompt from 'dialogs/prompt';
import actionStack from 'lib/actionStack';

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
 * @param {import('.').BrowseMode} [mode='file']
 * @param {string} [info]
 * @param {boolean} [doesOpenLast]
 * @returns {Promise<import('.').SelectedFile>}
 */
function FileBrowserInclude(mode, info, doesOpenLast = true) {
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
    const $menuToggler = <span className="icon more_vert" data-action='toggle-menu'></span>;
    const $addMenuToggler = <span className="icon add" data-action='toggle-add-menu'></span>;
    const $search = <span className="icon search" data-action='search'></span>;
    const $lead = <span className="icon clearclose" data-action='close'></span>;
    const $page = Page(strings['file browser'].capitalize(), {
      lead: $lead,
    });
    const $content = helpers.parseHTML(
      mustache.render(_template, {
        type: mode,
        info,
      }),
    );
    const $navigation = $content.get('.navigation');
    const menuOption = {
      top: '8px',
      right: '8px',
      toggler: $menuToggler,
      transformOrigin: 'top right',
    };
    const $fbMenu = Contextmenu({
      innerHTML: () => {
        return `
        <li action="settings">${strings.settings.capitalize(0)}</li>
        ${currentDir.url === '/' ? `<li action="refresh">${strings['reset connections'].capitalize(0)}</li>` : ''}
        <li action="reload">${strings.reload.capitalize(0)}</li>
        `;
      },
      ...menuOption,
    });
    const $addMenu = Contextmenu({
      innerHTML: () => {
        if (currentDir.url === '/') {
          return mustache.render(_addMenuHome, {
            ...strings,
          });
        } else {
          return mustache.render(_addMenu, strings);
        }
      },
      ...((menuOption.toggler = $addMenuToggler) && menuOption),
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
    $lead.onclick = close;
    $content.addEventListener('click', handleClick);
    $content.addEventListener('contextmenu', handleContextMenu, true);
    $page.body = $content;
    $page.header.append($search, $addMenuToggler, $menuToggler);


    if (IS_FOLDER_MODE) {
      $openFolder = tag('button', {
        className: 'floating icon check',
        style: {
          bottom: '10px',
          top: 'auto',
        },
        disabled: true,
        onclick() {
          $page.hide();

          if (IS_FREE_VERSION && window.iad?.isLoaded()) {
            window.iad.show();
          }

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
      action: close,
    });

    $fbMenu.onclick = function (e) {
      $fbMenu.hide();
      const action = e.target.getAttribute('action');
      if (action === 'settings') {
        filesSettings().show();
        const onshow = () => {
          $page.off('show', onshow);
          reload();
        };
        $page.on('show', onshow);
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
    };

    $addMenu.onclick = async (e) => {
      $addMenu.hide();
      const $target = e.target;
      const action = $target.getAttribute('action');
      const value = $target.getAttribute('value');
      if (!action) return;

      switch (action) {
        case 'create': {
          try {
            const newUrl = await create(value);
            if (!newUrl) break;

            const type = value === 'file' ? 'file' : 'folder';
            openFolder.add(newUrl, type);
            reload();
          } catch (error) {
            console.error(error);
            helpers.error(error);
          }
          break;
        }

        case 'add-path':
          addStorage();
          break;

        case 'addFtp':
        case 'addSftp': {
          const storage = await remoteStorage[action]();
          updateStorage(storage);
          break;
        }

        default:
          break;
      }
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

    function close() {
      const err = new Error('User cancelled');
      Object.defineProperty(err, 'code', {
        value: 0,
      });
      reject(err);
      $page.hide();
    }

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
      let action = $el.getAttribute('action') || $el.dataset.action;
      if (!action) return;

      let url = $el.dataset.url;
      let name = $el.dataset.name || $el.getAttribute('name');
      const idOpenDoc = $el.hasAttribute('open-doc');
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

      if (!url && action === 'open' && isDir && !idOpenDoc && !isContextMenu) {
        loader.hide();
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

      if (isContextMenu) action = 'contextmenu';
      else if (idOpenDoc) action = 'open-doc';

      switch (action) {
        case 'navigation':
          folder();
          break;
        case 'contextmenu':
          contextMenuHandler();
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
        const navigationArray = [];
        const dirs = home.split('/');
        const { url: parsedUrl, query } = Url.parse(url);
        let path = '';

        for (let dir of dirs) {
          path = Url.join(path, dir);
          navigationArray.push({
            url: `${Url.join(parsedUrl, path, '')}${query}`,
            name: dir || name,
          });
        }

        loadStates(navigationArray);
      }

      function file() {
        $page.hide();
        resolve({
          type: 'file',
          url,
          name,
        });
      }

      async function contextMenuHandler() {
        if (appSettings.value.vibrateOnTap) {
          navigator.vibrate(constants.VIBRATION_TIME);
        }
        if ($el.getAttribute('open-doc') === 'true') return;

        const deleteText = currentDir.url === '/' ? strings.remove : strings.delete;
        const options = [
          ['delete', deleteText, 'delete'],
          ['rename', strings.rename, 'text_format'],
        ];

        if (/s?ftp/.test(storageType)) {
          options.push(['edit', strings.edit, 'edit']);
        }

        if (helpers.isFile(type)) {
          options.push(['info', strings.info, 'info']);
        }

        const option = await select(strings['select'], options);
        switch (option) {
          case 'delete': {
            let deleteFunction = removeFile;
            let message = strings['delete entry'].replace('{name}', name);
            if (uuid) {
              deleteFunction = removeStorage;
              message = strings['remove entry'].replace('{name}', name);
            }

            const confirmation = await confirm(strings.warning, message);
            if (!confirmation) break;
            deleteFunction();
            break;
          }

          case 'rename': {
            let newname = await prompt(strings.rename, name, 'text', {
              match: constants.FILE_NAME_REGEX,
            });

            newname = helpers.fixFilename(newname);
            if (!newname || newname === name) break;

            if (uuid) renameStorage(newname);
            else renameFile(newname);
            break;
          }

          case 'edit': {
            const storage = await remoteStorage.edit(storageList.find((storage) => storage.uuid === uuid));
            if (!storage) break;
            storage.uuid = uuid;
            updateStorage(storage);
            break;
          }

          case 'info':
            acode.exec('file-info', url);
            break;
        }
      }

      async function renameFile(newname) {
        const fs = fsOperation(url);
        try {
          const newUrl = await fs.renameTo(newname);
          recents.removeFile(url);
          recents.addFile(newUrl);
          const file = editorManager.getFile(url, 'uri');
          if (file) {
            file.uri = newUrl;
            file.filename = newname;
          }
          openFolder.renameItem(url, newUrl, newname);
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
          openFolder.removeItem(url);

          if (helpers.isDir(type)) {
            helpers.updateUriOfAllActiveFiles(url);
            recents.removeFolder(url);
          } else {
            const openedFile = editorManager.getFile(url, 'uri');
            if (openedFile) openedFile.uri = null;
          }
          toast(strings.success);
          delete cachedDir[url];
          reload();
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
        checkFiles.check = false;
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
        let url = storage.url || /**@deprecated */ storage['uri'];

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
            loader.create(name, strings.loading + '...', {
              timeout: 10000,
              callback() {
                loader.destroy();
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
          loader.destroy();
        }
        if (error) return null;
        return {
          url,
          name,
          scroll: 0,
          list: helpers.sortDir(list, fileBrowser, mode),
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
          const url = $topNav.dataset.url;
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
      let ctUrl = '';
      let projectLocation = null;
      let projectFiles = '';
      let projectName = '';
      let project = '';
      let newUrl;

      if (arg === 'file' || arg === 'folder') {
        let title = strings['enter folder name'];
        if (arg === 'file') {
          title = strings['enter file name'];
        }

        let entryName = await prompt(title, '', 'filename', {
          match: constants.FILE_NAME_REGEX,
          required: true,
        });

        if (!entryName) return;
        entryName = helpers.fixFilename(entryName);

        const fs = fsOperation(url);
        if (arg === 'folder') {
          newUrl = await fs.createDirectory(entryName);
        }
        if (arg === 'file') {
          newUrl = await fs.createFile(entryName);
        }
        return newUrl;
      }

      if (arg === 'project') {
        projects.list().map((project) => {
          const { name, icon } = project;
          options.push([name, name, icon]);
        });

        project = await select(strings['new project'], options);
        loader.create(project, strings.loading + '...');
        projectFiles = await projects.get(project).files();
        loader.destroy();
        projectName = await prompt(
          strings['project name'],
          project,
          'text',
          {
            required: true,
            match: constants.FILE_NAME_REGEX,
          },
        );

        if (!projectName) return;
        loader.create(projectName, strings.loading + '...');
        const fs = fsOperation(url);
        const files = Object.keys(projectFiles); // All project files

        newUrl = await fs.createDirectory(projectName);
        projectLocation = Url.join(url, projectName, '/');
        await createProject(files); // Creating project
        loader.destroy();
        return newUrl;
      }

      async function createProject(files) {
        // checking if it's the last file
        if (!files.length) {
          reload();
          return;
        }
        ctUrl = '';
        const file = files.pop();
        await createFile(file);
        return await createProject(files);
      }

      function createFile(fileUrl) {
        const paths = fileUrl.split('/');
        const filename = paths.pop();
        return createDir(projectFiles, fileUrl, filename, paths);
      }

      async function createDir(project, fileUrl, filename, paths) {
        const lclUrl = Url.join(projectLocation, ctUrl);
        const fs = fsOperation(lclUrl);

        if (paths.length === 0) {
          const data = project[fileUrl].replace(/<%name%>/g, projectName);
          await fs.createFile(filename, data);
          return;
        }

        const name = paths.splice(0, 1)[0];
        const toCreate = Url.join(lclUrl, name);
        if (!alreadyCreated.includes(toCreate)) {
          await fs.createDirectory(name);
          alreadyCreated.push(toCreate);
        }
        ctUrl += name + '/';
        return await createDir(project, fileUrl, filename, paths);
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
        <span
          id={getNavId(url)}
          className='nav'
          data-url={url}
          data-name={name}
          attr-action='navigation'
          attr-text={name}
          tabIndex={-1}
        ></span>
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
     *
     * @param {Storage} storage
     * @param {Boolean} doesReload
     */
    function updateStorage(storage, doesReload = true) {
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
      if (doesReload) reload();
    }

    function render(dir) {
      const { list, scroll } = dir;
      const $list = helpers.parseHTML(
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
