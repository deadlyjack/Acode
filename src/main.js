import "./styles/index.scss";
import "./styles/page.scss";
import './styles/list.scss';
import './styles/sidenav.scss';
import './styles/tile.scss';
import './styles/contextMenu.scss';
import './styles/dialogs.scss';
import './styles/themes.scss';
import './styles/help.scss';
import './styles/overrideAceStyle.scss';

import "core-js/stable";
import tag from 'html-tag-js';
import mustache from 'mustache';
import tile from "./components/tile";
import sidenav from './components/sidenav';
import contextMenu from './components/contextMenu';
import EditorManager from './modules/editorManager';
import fs from './modules/utils/internalFs';
import ActionStack from "./modules/actionStack";
import helpers from "./modules/helpers";
import Settings from "./settings";
import dialogs from "./components/dialogs";
import constants from "./constants";
import HandleIntent from "./modules/handleIntent";
import createEditorFromURI from "./modules/createEditorFromURI";
import openFolder from "./modules/addFolder";
import arrowkeys from "./modules/events/arrowkeys";

import $_menu from './views/menu.hbs';
import $_fileMenu from './views/file-menu.hbs';
import git from "./modules/git";
import commands from "./commands/commands";
import externalStorage from "./modules/externalStorage";
import keyBindings from './keyBindings';
import handleQuickTools from "./modules/handleQuickTools";
import rateBox from "./components/rateBox";
import loadPolyFill from "./modules/polyfill";
import internalFs from "./modules/utils/internalFs";
//@ts-check

loadPolyFill.apply(window);
window.onload = Main;

function Main() {
  let timeout, alert = window.alert;
  const oldPreventDefault = TouchEvent.prototype.preventDefault;
  TouchEvent.prototype.preventDefault = function () {
    if (this.cancelable) {
      oldPreventDefault.bind(this)();
    }
  };

  const language = navigator.language.toLowerCase();
  let lang = null;
  if (!localStorage.globalSettings && language in constants.langList) {
    lang = language;
  }

  if (!BuildInfo.debug) {
    setTimeout(() => {
      if (document.body.classList.contains('loading')) {
        if (!alert("Something went wrong! Please clear app data and restart the app."))
          if (navigator.app && navigator.app.exitApp) navigator.app.exitApp();
      }
    }, 1000 * 30);
  }

  setTimeout(() => {
    if (document.body.classList.contains('loading'))
      document.body.setAttribute('data-small-msg', 'This is taking unexpectedly long time!');
  }, 1000 * 10);

  window.root = tag(window.root);
  window.app = document.body = tag(document.body);
  window.actionStack = ActionStack();
  window.editorCount = 0;
  window.alert = dialogs.alert;
  window.addedFolder = [];
  window.fileClipBoard = null;
  window.restoreTheme = restoreTheme;
  window.getCloseMessage = () => {};
  window.beforeClose = null;
  window.saveInterval = null;
  window.editorManager = {
    files: [],
    activeFile: null
  };
  window.externalStorage = externalStorage;
  window.customKeyBindings = null;
  window.defaultKeyBindings = keyBindings;
  window.keyBindings = name => {
    if (customKeyBindings && name in window.customKeyBindings)
      return window.customKeyBindings[name].key;
    else if (name in defaultKeyBindings)
      return defaultKeyBindings[name].key;
    else
      return null;
  };

  document.addEventListener("deviceready", () => {

    window.DATA_STORAGE = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
    window.CACHE_STORAGE = cordova.file.externalCacheDirectory || cordova.file.cacheDirectory;
    window.CACHE_STORAGE_REMOTE = CACHE_STORAGE + 'ftp-temp/';
    window.KEYBINDING_FILE = DATA_STORAGE + '.key-bindings.json';
    window.gitRecordURL = DATA_STORAGE + 'git/.gitfiles';
    window.gistRecordURL = DATA_STORAGE + 'git/.gistfiles';

    document.body.setAttribute('data-version', 'v' + BuildInfo.version);

    const permissions = cordova.plugins.permissions;
    const requiredPermissions = [
      permissions.WRITE_EXTERNAL_STORAGE,
      permissions.WRITE_MEDIA_STORAGE
    ];

    requiredPermissions.map((permission, i) => {
      permissions.checkPermission(permission, (status) => success(status, i));
    });

    function success(status, i) {
      if (!status.hasPermission) {
        permissions.requestPermission(requiredPermissions[i], () => {});
      }
    }

    window.appSettings = new Settings(lang);
    if (appSettings.loaded) {
      ondeviceready();
    } else {
      appSettings.onload = ondeviceready;
    }
  });

  function ondeviceready() {

    if (!('files' in localStorage)) {
      localStorage.setItem('files', '[]');
    }
    if (!('folders' in localStorage)) {
      localStorage.setItem('folders', '[]');
    }


    if (!window.loaded) window.loaded = true;
    else return;

    const languageFile = `${cordova.file.applicationDirectory}www/lang/${appSettings.value.lang}.json`;

    fs.readFile(KEYBINDING_FILE)
      .then(res => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(res.data);
        try {

          let bindings = JSON.parse(text);
          window.customKeyBindings = bindings;

        } catch (error) {

          helpers.error(error);
          return Promise.reject;

        }
      })
      .catch(helpers.resetKeyBindings)
      .finally(() => {
        loadAceEditor()
          .then(() => {
            ace.config.set('basePath', './res/ace/src/');
            window.modelist = ace.require('ace/ext/modelist');
            window.AceMouseEvent = ace.require('ace/mouse/mouse_event').MouseEvent;
            return fs.readFile(languageFile);
          })
          .then(res => {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(res.data);
            window.strings = JSON.parse(text);
            initGit();
          })
          .catch(err => {
            helpers.error(err);
            console.log(err);
          });
      });
  }

  function initGit() {

    timeout = setTimeout(initGit, 1000);

    git.init()
      .then(() => {
        if (timeout) clearTimeout(timeout);
        return internalFs.listDir(cordova.file.applicationDirectory + 'www/css/build/');
      })
      .then(entries => {
        const styles = [];
        entries.map(entry => {
          styles.push(entry.nativeURL);
        });
        return helpers.loadStyles(...styles);
      })
      .then(res => {
        runApp();
      })
      .catch(err => {
        if (timeout) clearTimeout(timeout);
        console.log(err);
      });
  }
}

function loadAceEditor() {
  const aceScript = [
    "./res/ace/src/ace.js",
    "./res/ace/emmet-core.js",
    "./res/ace/src/ext-language_tools.js",
    "./res/ace/src/ext-emmet.js",
    "./res/ace/src/ext-beautify.js",
    "./res/ace/src/ext-modelist.js"
  ];
  return helpers.loadScripts(...aceScript);
}

function runApp() {

  if (!window.runAppInitialized) window.runAppInitialized = true;
  else return;

  app.addEventListener('click', function (e) {
    const el = e.target;
    if (el instanceof HTMLAnchorElement) {
      e.preventDefault();
      e.stopPropagation();

      window.open(el.href, '_system');
    }
  });

  const version = localStorage.getItem('version');
  if (version !== BuildInfo.version) {
    localStorage.clear();
    localStorage.setItem('version', BuildInfo.version);
  }

  const Acode = {
    exec: function (key, val) {
      if (key in commands) {
        commands[key](val);
        return true;
      } else {
        return false;
      }
    }
  };

  window.Acode = Acode;
  document.addEventListener('backbutton', actionStack.pop);
  window.beautify = ace.require("ace/ext/beautify").beautify;

  new App();
}

function App() {
  if (!window.appInitialized) window.appInitialized = true;
  else return;
  //#region declaration
  const $edit = tag('span', {
    className: 'icon edit',
    attr: {
      style: 'font-size: 1.2em !important;',
      action: 'toggle-readonly'
    }
  });
  const $toggler = tag('span', {
    className: 'icon menu',
    attr: {
      action: 'toggle-sidebar'
    }
  });
  const $menuToggler = tag("span", {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu'
    }
  });
  const $header = tile({
    type: 'header',
    text: 'Acode',
    lead: $toggler,
    tail: $menuToggler
  });
  const $footer = tag('footer', {
    id: "quick-tools",
    tabIndex: -1,
    onclick: handleQuickTools.clickListener
  });
  const $mainMenu = contextMenu(mustache.render($_menu, strings), {
    top: '6px',
    right: '6px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });
  const $fileMenu = contextMenu({
    toggle: $edit,
    top: '6px',
    transformOrigin: 'top right',
    innerHTML: () => {
      return mustache.render($_fileMenu, Object.assign(strings, {
        file_mode: (editorManager.activeFile.session.getMode().$id || '').split('/').pop(),
        file_encoding: editorManager.activeFile.encoding,
        file_readOnly: editorManager.activeFile.editable ? strings.no : strings.yes,
        setting_quickTools: appSettings.value.quickTools
      }));
    }
  });
  const $main = tag('main');
  const $sidebar = sidenav($main, $toggler);
  const $runBtn = tag('span', {
    className: 'icon play_arrow',
    attr: {
      action: 'run-file'
    },
    onclick: () => {
      Acode.exec("run");
    },
    style: {
      fontSize: '1.2em'
    }
  });
  const fileOptions = {
    save: $mainMenu.querySelector('[action=save]'),
    saveAs: $mainMenu.querySelector('[action="save-as"]')
  };
  const actions = ["saveFile", "saveFileAs", "newFile", "nextFile", "prevFile", "openFile", "run", "find", "replace"];
  let registeredKey = '';

  $sidebar.setAttribute('empty-msg', strings['open folder']);
  window.editorManager = EditorManager($sidebar, $header, $main);
  const editor = editorManager.editor;
  //#endregion

  window.restoreTheme();
  $main.setAttribute("data-empty-msg", strings['no editor message']);

  //Asks for rating if used more than 5 times
  let count = parseInt(localStorage.count) || 0;
  if (count === constants.RATING_TIME) rateBox();
  else localStorage.count = ++count;

  //#region rendering
  $header.classList.add('light');
  root.append($header, $main, $footer);
  //#endregion

  $fileMenu.addEventListener('click', handleMenu);
  $mainMenu.addEventListener('click', handleMenu);
  $footer.addEventListener('touchstart', footerTouchStart);
  $footer.addEventListener('contextmenu', footerOnContextMenu);
  document.addEventListener('keydown', handleMainKeyDown);
  document.addEventListener('keyup', handleMainKeyUp);

  if (appSettings.value.quickTools) handleQuickTools.actions("enable-quick-tools");
  window.beforeClose = saveState;

  loadFolders();
  loadFiles()
    .then(() => {

      if (!editorManager.files.length) createDefaultFile();

      setTimeout(() => {
        app.classList.remove('loading', 'splash');
      }, 500);
      //#region event listeners 

      window.plugins.intent.setNewIntentHandler(HandleIntent);
      window.plugins.intent.getCordovaIntent(HandleIntent, function (e) {
        console.log("Error: Cannot handle open with file intent", e);
      });
      document.addEventListener('menubutton', $sidebar.toggle);
      navigator.app.overrideButton("menubutton", true);
      document.addEventListener('pause', () => {
        window.resolveLocalFileSystemURL(CACHE_STORAGE_REMOTE, () => {
          internalFs.deleteFile(CACHE_STORAGE_REMOTE);
        });
        saveState();
      });
      document.addEventListener('resume', checkFiles);
      checkFiles();

      const autoSave = parseInt(appSettings.value.autosave);
      if (autoSave) {
        saveInterval = setInterval(() => {
          editorManager.files.map(file => {
            if (file.isUnsaved && file.location) Acode.exec("save", false);
            return file;
          });
        }, autoSave);
      }
    });

  editorManager.onupdate = function () {
    /**
     * @type {File}
     */
    const activeFile = this.activeFile;
    const $save = $footer.querySelector('[action=save]');

    if (!$edit.isConnected) {
      $header.insertBefore($edit, $header.lastChild);
    }

    if (activeFile) {
      fileOptions.saveAs.classList.remove('disabled');

      if (!activeFile.readOnly) {
        fileOptions.save.classList.remove('disabled');
        if ($save) $save.classList.remove('disabled');
      } else {
        fileOptions.save.classList.add('disabled');
        if ($save) $save.classList.add('disabled');
      }

      if (activeFile.isUnsaved) {
        activeFile.assocTile.classList.add('notice');
        if ($save) $save.classList.add('notice');
      } else {
        activeFile.assocTile.classList.remove('notice');
        if ($save) $save.classList.remove('notice');
      }

      this.editor.setReadOnly(!activeFile.editable);

      if (['html', 'htm', 'xhtml', 'md', 'js', 'php'].includes(helpers.getExt(activeFile.filename))) {
        $header.insertBefore($runBtn, $header.lastChild);
      } else {
        $runBtn.remove();
      }
    }

    saveState();
  };

  window.getCloseMessage = function () {
    const numFiles = editorManager.hasUnsavedFiles();
    if (numFiles) {
      return strings["unsaved files close app"];
    }
  };

  $sidebar.onshow = function () {
    const activeFile = editorManager.activeFile;
    if (activeFile) editor.blur();
  };

  /**
   * 
   * @param {KeyboardEvent} e 
   */
  function handleMainKeyDown(e) {
    registeredKey = helpers.getCombination(e);
    if (registeredKey === 'escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
  }

  /**
   * 
   * @param {KeyboardEvent} e 
   */
  function handleMainKeyUp(e) {
    let key = helpers.getCombination(e);
    if (key !== registeredKey) return;

    if (key === 'escape') {
      if (actionStack.length) actionStack.pop();
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      return;
    }

    if (actionStack.length || editorManager.editor.isFocused()) return;
    for (let name in keyBindings) {
      const obj = keyBindings[name];
      const binding = (obj.key || '').toLowerCase();
      if (
        binding === key &&
        actions.includes(name) &&
        'action' in obj
      ) Acode.exec(obj.action);
    }
  }

  function saveState() {
    const lsEditor = [];
    const folders = [];
    const activeFile = editorManager.activeFile;
    const unsaved = [];

    for (let file of editorManager.files) {
      if (file.id === constants.DEFAULT_SESSION && !file.session.getValue()) continue;
      const edit = {};
      edit.name = file.filename;
      edit.type = file.type;
      edit.id = file.id;
      if (edit.type === 'git') edit.sha = file.record.sha;
      else if (edit.type === 'gist') {
        edit.recordid = file.record.id;
        edit.isNew = file.record.isNew;
      }
      if (file.fileUri) {
        edit.fileUri = file.fileUri;
        edit.contentUri = file.contentUri;
        unsaved.push({
          id: btoa(file.id),
          fileUri: file.fileUri
        });
      } else if (file.contentUri) {
        edit.contentUri = file.contentUri;
      }
      if (file.isUnsaved) {
        edit.data = file.session.getValue();
      }
      edit.cursorPos = editorManager.editor.getCursorPosition();
      lsEditor.push(edit);
    }

    unsaved.map(file => {
      const protocol = new URL(file.fileUri).protocol;
      if (protocol === 'file:') {
        window.resolveLocalFileSystemURL(file.fileUri, fs => {
          window.resolveLocalFileSystemURL(CACHE_STORAGE, parent => {
            fs.copyTo(parent, file.id);
          }, err => {
            console.error(err);
          });
        }, err => {
          console.error(err);
        });
      }
      return file;
    });

    addedFolder.map(folder => {
      const {
        url,
        reloadOnResume,
        saveState
      } = folder;
      folders.push({
        url,
        opts: {
          saveState,
          reloadOnResume
        }
      });
      return folder;
    });

    if (activeFile) {
      localStorage.setItem('lastfile', activeFile.id);
    }

    localStorage.setItem('files', JSON.stringify(lsEditor));
    localStorage.setItem('folders', JSON.stringify(folders));
  }

  function loadFiles() {
    return new Promise((resolve) => {
      if ('files' in localStorage) {
        /**
         * @type {storedFiles[]}
         */
        const files = helpers.parseJSON(localStorage.getItem('files'));

        if (!files || !files.length) {
          createDefaultFile();
          resolve();
          return;
        }

        const lastfile = localStorage.getItem('lastfile') || files.slice(-1)[0].url;
        files.map((file, i) => {

          const xtra = {
            text: file.data,
            cursorPos: file.cursorPos,
            saved: false,
            render: (files.length === 1 || (file.id + '') === lastfile) ? true : false,
            index: i
          };

          if (file.type === 'git') {
            gitRecord.get(file.sha)
              .then(record => {
                if (record) {
                  editorManager.addNewFile(file.name, {
                    type: 'git',
                    text: file.data || record.data,
                    isUnsaved: file.data ? true : false,
                    record,
                    render: xtra.render,
                    cursorPos: file.cursorPos
                  });
                }
                if (i === files.length - 1) resolve();
              });
          } else if (file.type === 'gist') {
            const gist = gistRecord.get(file.recordid, file.isNew);
            if (gist) {
              const gistFile = gist.files[file.name];
              editorManager.addNewFile(file.name, {
                type: 'gist',
                text: file.data || gistFile.content,
                isUnsaved: file.data ? true : false,
                record: gist,
                render: xtra.render,
                cursorPos: file.cursorPos
              });
            }
            if (i === files.length - 1) resolve();
          } else if (file.fileUri) {


            if (file.data) {
              xtra.saved = false;
            } else {
              xtra.saved = true;
            }

            createEditorFromURI({
              fileUri: file.fileUri,
              contentUri: file.contentUri
            }, false, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });
          } else if (file.contentUri) {

            if (file.contentUri === lastfile) {
              xtra.render = true;
            }

            createEditorFromURI({
              name: file.name,
              contentUri: file.contentUri,
            }, true, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });

          } else {
            editorManager.addNewFile(file.name, {
              render: xtra.render,
              isUnsaved: !!file.data,
              cursorPos: file.cursorPos,
              text: file.data
            });

            if (i === files.length - 1) resolve();
          }
          return file;
        });
      } else {
        createDefaultFile();
        resolve();
      }
    });
  }

  function createDefaultFile() {
    editorManager.addNewFile(constants.DEFAULT_FILE_NAME, {
      isUnsaved: false,
      render: true,
      id: constants.DEFAULT_SESSION
    });
  }

  function loadFolders() {
    try {
      const folders = JSON.parse(localStorage.getItem('folders'));
      folders.map(folder => {
        openFolder(folder.url, folder.opts);
      });
    } catch (error) {}
  }

  function checkFiles(e) {
    const files = editorManager.files;

    files.map(file => {
      if (file.type === 'git') return;
      if (file.fileUri) {
        const id = btoa(file.id);
        window.resolveLocalFileSystemURL(CACHE_STORAGE + id, entry => {
          fs.readFile(CACHE_STORAGE + id).then(res => {
            const data = res.data;
            const decoder = new TextDecoder("utf-8");
            const originalText = decoder.decode(data);

            fs.deleteFile(CACHE_STORAGE + id)
              .catch(err => {
                console.log(err);
              });

            window.resolveLocalFileSystemURL(file.fileUri, () => {
              fs.readFile(file.fileUri).then(res => {
                const data = res.data;
                const text = decoder.decode(data);

                if (text !== originalText) {
                  if (!file.isUnsaved) {
                    update(file, text);
                  } else {
                    dialogs.confirm(strings.warning.toUpperCase(), file.filename + strings['file changed'])
                      .then(() => {
                        update(file, text);
                        editorManager.onupdate.call({
                          activeFile: editorManager.activeFile
                        });
                      });
                  }
                }
              }).catch(err => {
                console.error(err);
              });
            }, err => {
              if (err.code === 1) {
                editorManager.removeFile(file);
              }
            });
          });
        }, err => {});
      }
      return file;
    });

    if (!editorManager.activeFile) {
      app.focus();
    }

    /**
     * 
     * @param {File} file 
     * @param {string} text 
     */
    function update(file, text) {
      const cursorPos = editorManager.editor.getCursorPosition();
      file.session.setValue(text);
      file.isUnsaved = false;
      editorManager.editor.gotoLine(cursorPos.row, cursorPos.column);
      editorManager.editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
      file.assocTile.classList.remove('notice');
    }
  }
  //#endregion

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handleMenu(e) {
    const $target = e.target;
    const action = $target.getAttribute('action');
    const value = $target.getAttribute('value');
    if (!action) return;

    if ($mainMenu.contains($target)) $mainMenu.hide();
    if ($fileMenu.contains($target)) $fileMenu.hide();
    Acode.exec(action, value);
  }

  function footerTouchStart(e) {
    arrowkeys.onTouchStart(e, $footer);
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function footerOnContextMenu(e) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    e.preventDefault();
    editor.focus();
  }

}

//#region global funtions

function restoreTheme(darken) {
  if (darken && document.body.classList.contains('loading')) return;

  if (appSettings.value.appTheme === 'default') {
    const hexColor = darken ? '#5c5c99' : '#9999ff';
    app.classList.remove('theme-light');
    app.classList.remove('theme-dark');
    app.classList.add('theme-default');
    NavigationBar.backgroundColorByHexString(hexColor, false);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  } else if (appSettings.value.appTheme === 'light') {
    const hexColor = darken ? '#999999' : '#ffffff';
    app.classList.remove('theme-default');
    app.classList.remove('theme-dark');
    app.classList.add('theme-light');
    NavigationBar.backgroundColorByHexString(hexColor, !!darken);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleDefault();
  } else {
    const hexColor = darken ? '#1d1d1d' : '#313131';
    app.classList.remove('theme-default');
    app.classList.remove('theme-light');
    app.classList.add('theme-dark');
    NavigationBar.backgroundColorByHexString(hexColor, true);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  }
}
//#endregion