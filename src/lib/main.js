import "../styles/main.scss";
import "../styles/themes.scss";
import "../styles/page.scss";
import '../styles/list.scss';
import '../styles/sidenav.scss';
import '../styles/tile.scss';
import '../styles/contextMenu.scss';
import '../styles/dialogs.scss';
import '../styles/help.scss';
import '../styles/overrideAceStyle.scss';

import "core-js/stable";
import "html-tag-js/dist/polyfill";
import tag from 'html-tag-js';
import mustache from 'mustache';
import tile from "../components/tile";
import sidenav from '../components/sidenav';
import contextMenu from '../components/contextMenu';
import EditorManager from './editorManager';
import fs from './fileSystem/internalFs';
import ActionStack from "./actionStack";
import helpers from "./utils/helpers";
import Settings from "./settings";
import dialogs from "../components/dialogs";
import constants from "./constants";
import intentHandler from "./handlers/intent";
import openFile from "./openFile";
import openFolder from "./openFolder";
import arrowkeys from "./handlers/arrowkeys";

import $_menu from '../views/menu.hbs';
import $_fileMenu from '../views/file-menu.hbs';
import $_hintText from '../views/hint-txt.hbs';
import git from "./git";
import commands from "./commands";
import keyBindings from './keyBindings';
import quickTools from "./handlers/quickTools";
import rateBox from "../components/dialogboxes/rateBox";
import loadPolyFill from "./utils/polyfill";
import internalFs from "./fileSystem/internalFs";
import Url from "./utils/Url";
import backupRestore from "../pages/settings/backup-restore";
import applySettings from "./applySettings";
import fsOperation from "./fileSystem/fsOperation";
import ajax from "./utils/ajax";
import runPreview from "./runPreview";

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

  ajax({
      url: "https://acode.foxdebug.com/api/getad",
      responseType: "json"
    })
    .then(res => {
      window.ad = res;
      if (res.image) {
        return ajax({
          url: res.image,
          responseType: 'arraybuffer'
        });
      } else {
        return Promise.resolve(res);
      }
    })
    .then(res => {
      if (res instanceof ArrayBuffer)
        ad.image = URL.createObjectURL(new Blob([res]));
    });

  window.root = tag(window.root);
  window.app = document.body = tag(document.body);
  window.actionStack = ActionStack();
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
    system.clearCache(res => console.log("clear cache", res), err => console.error(err));

    const oldRURL = window.resolveLocalFileSystemURL;

    window.resolveLocalFileSystemURL = function (url, ...args) {
      oldRURL.call(this, Url.safe(url), ...args);
    };

    if (!BuildInfo.debug) {
      setTimeout(() => {
        if (document.body.classList.contains('loading'))
          alert("Something went wrong! Please clear app data and restart the app or wait.");
      }, 1000 * 30);
    }

    setTimeout(() => {
      if (document.body.classList.contains('loading'))
        document.body.setAttribute('data-small-msg', "This is taking unexpectedly long time!");
    }, 1000 * 10);

    window.IS_FREE_VERSION = /(free)$/.test(BuildInfo.packageName);
    window.DATA_STORAGE = cordova.file.externalDataDirectory || cordova.file.dataDirectory;
    window.TEMP_STORAGE = DATA_STORAGE + "tmp/";
    window.CACHE_STORAGE = cordova.file.externalCacheDirectory || cordova.file.cacheDirectory;
    window.CACHE_STORAGE_REMOTE = CACHE_STORAGE + 'ftp-temp/';
    window.KEYBINDING_FILE = DATA_STORAGE + '.key-bindings.json';
    window.gitRecordURL = DATA_STORAGE + 'git/.gitfiles';
    window.gistRecordURL = DATA_STORAGE + 'git/.gistfiles';
    window.IS_ANDROID_VERSION_5 = /^5/.test(device.version);
    window.DOES_SUPPORT_THEME = (() => {
      const $testEl = tag('div', {
        style: {
          height: `var(--test-height)`,
          width: `var(--test-height)`
        }
      });
      document.body.append($testEl);
      const client = $testEl.getBoundingClientRect();

      $testEl.remove();

      if (client.height === 0) return false;
      else return true;
    })();

    fsOperation(TEMP_STORAGE)
      .then(fs => {
        return fs.deleteDir();
      })
      .finally(() => {
        fsOperation(DATA_STORAGE)
          .then(fs => {
            fs.createDirectory("tmp/");
          });
      });

    document.body.setAttribute('data-version', 'v' + BuildInfo.version);

    const permissions = cordova.plugins.permissions;
    const requiredPermissions = [
      permissions.WRITE_EXTERNAL_STORAGE,
      permissions.WRITE_MEDIA_STORAGE
    ];

    requiredPermissions.map((permission, i) => permissions.checkPermission(permission, (status) => success(status, i)));

    function success(status, i) {
      if (!status.hasPermission) {
        permissions.requestPermission(requiredPermissions[i], () => {});
      }
    }

    document.body.setAttribute('data-small-msg', "Loading settings...");
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

    document.body.setAttribute('data-small-msg', "Loading modules...");
    fs.readFile(KEYBINDING_FILE)
      .then(res => {
        const text = helpers.decodeText(res.data);
        try {

          let bindings = JSON.parse(text);
          window.customKeyBindings = bindings;

        } catch (error) {

          return Promise.reject;

        }
      })
      .catch(helpers.resetKeyBindings)
      .finally(() => {
        document.body.setAttribute('data-small-msg', "Loading editor...");
        loadAceEditor()
          .then(() => {
            ace.config.set('basePath', './res/ace/src/');
            window.modelist = ace.require('ace/ext/modelist');
            window.AceMouseEvent = ace.require('ace/mouse/mouse_event').MouseEvent;
            return fs.readFile(languageFile);
          })
          .then(res => {
            const text = helpers.decodeText(res.data);
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
        entries.map(entry => styles.push(entry.nativeURL));
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
    "./res/ace/src/ext-code_lens.js",
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
    let el = e.target;
    if (el instanceof HTMLAnchorElement || checkIfInsideAncher()) {
      e.preventDefault();
      e.stopPropagation();

      window.open(el.href, '_system');
    }

    function checkIfInsideAncher() {
      const allAs = [...tag.getAll('a')];

      for (let a of allAs) {
        if (a.contains(el)) {
          el = a;
          return true;
        }
      }

      return false;
    }
  });

  const Acode = {
    /**
     * 
     * @param {string} key 
     * @param {string} val 
     */
    exec(key, val) {
      if (key in commands) {
        commands[key](val);
        return true;
      } else {
        return false;
      }
    },
    $menuToggler: null,
    $editMenuToggler: null
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
  const $editMenuToggler = tag('span', {
    className: 'icon edit',
    attr: {
      style: 'font-size: 1.2em !important;',
      action: ''
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
    onclick: quickTools.clickListener
  });
  const $mainMenu = contextMenu({
    top: '6px',
    right: '6px',
    toggle: $menuToggler,
    transformOrigin: 'top right',
    innerHTML: () => {
      return mustache.render($_menu, strings);
    }
  });
  const $fileMenu = contextMenu({
    toggle: $editMenuToggler,
    top: '6px',
    transformOrigin: 'top right',
    innerHTML: () => {
      const file = editorManager.activeFile;
      return mustache.render($_fileMenu, Object.assign(strings, {
        file_mode: (file.session.getMode().$id || '').split('/').pop(),
        file_encoding: file.encoding,
        file_read_only: !file.editable,
        file_info: !!file.uri
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
  const $headerToggler = tag('span', {
    className: 'floating icon keyboard_arrow_left',
    id: "header-toggler"
  });
  const $quickToolToggler = tag('span', {
    className: 'floating icon keyboard_arrow_up',
    id: "quicktool-toggler"
  });
  const actions = constants.COMMANDS;
  let registeredKey = '',
    editor;
  //#endregion

  Acode.$menuToggler = $menuToggler;
  Acode.$editMenuToggler = $editMenuToggler;
  Acode.$headerToggler = $headerToggler;
  Acode.$quickToolToggler = $quickToolToggler;
  Acode.$runBtn = $runBtn;

  $sidebar.setAttribute('empty-msg', strings['open folder']);
  window.editorManager = EditorManager($sidebar, $header, $main);
  editor = editorManager.editor;

  const fmode = appSettings.value.floatingButtonActivation;
  const activationMode = fmode === "long tap" ? "oncontextmenu" : "onclick";
  $headerToggler[activationMode] = function () {
    root.classList.toggle("show-header");
    this.classList.toggle("keyboard_arrow_left");
    this.classList.toggle("keyboard_arrow_right");
  };
  $quickToolToggler[activationMode] = function () {
    Acode.exec("toggle-quick-tools");
  };

  //#region rendering
  applySettings.beforeRender();
  window.restoreTheme();
  root.append($header, $main, $footer, $headerToggler, $quickToolToggler);
  if (!appSettings.value.floatingButton) root.classList.add("hide-floating-button");
  applySettings.afterRender();
  //#endregion

  $fileMenu.addEventListener('click', handleMenu);
  $mainMenu.addEventListener('click', handleMenu);
  $footer.addEventListener('touchstart', footerTouchStart);
  $footer.addEventListener('contextmenu', footerOnContextMenu);
  document.addEventListener('keydown', handleMainKeyDown);
  document.addEventListener('keyup', handleMainKeyUp);

  window.beforeClose = saveState;

  loadFolders();
  document.body.setAttribute('data-small-msg', "Loading files...");
  loadFiles()
    .then(() => {

      document.body.removeAttribute('data-small-msg');

      setTimeout(() => {
        app.classList.remove('loading', 'splash');
        onAppLoad();
      }, 500);

      window.plugins.intent.setNewIntentHandler(intentHandler);
      window.plugins.intent.getCordovaIntent(intentHandler, function (e) {
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
    });

  editorManager.onupdate = function (doSaveState = true) {
    /**
     * @type {File}
     */
    const activeFile = editorManager.activeFile;
    const $save = $footer.querySelector('[action=save]');

    if (!$editMenuToggler.isConnected)
      $header.insertBefore($editMenuToggler, $header.lastChild);

    if (activeFile) {
      if (activeFile.isUnsaved) {
        activeFile.assocTile.classList.add('notice');
        if ($save) $save.classList.add('notice');
      } else {
        activeFile.assocTile.classList.remove('notice');
        if ($save) $save.classList.remove('notice');
      }

      editorManager.editor.setReadOnly(!activeFile.editable);

      runPreview.checkRunnable()
        .then(res => {
          if (res) {
            $runBtn.setAttribute("run-file", res);
            $header.insertBefore($runBtn, $header.lastChild);
          } else {
            $runBtn.removeAttribute("run-file");
            $runBtn.remove();
          }
        })
        .catch(err => {
          $runBtn.removeAttribute("run-file");
          $runBtn.remove();
        });
    }

    if (doSaveState) saveState();
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

  function onAppLoad() {
    if (localStorage.count === undefined) localStorage.count = 0;
    let count = +localStorage.count;

    if (count === constants.RATING_COUNT) askForRating();
    else if (count === constants.DONATION_COUNT) askForDonation();
    else ++localStorage.count;

    if (!localStorage.init) showWelcomeMessage();
  }

  /**
   * 
   * @param {KeyboardEvent} e 
   */
  function handleMainKeyDown(e) {
    registeredKey = helpers.getCombination(e);
  }

  /**
   * 
   * @param {KeyboardEvent} e 
   */
  function handleMainKeyUp(e) {
    let key = helpers.getCombination(e);
    if (registeredKey && key !== registeredKey) return;

    const isFocused = editor.textInput.getElement() === document.activeElement;
    if (key === "escape" && (!actionStack.length || isFocused)) e.preventDefault();
    if (actionStack.length || isFocused) return;
    for (let name in keyBindings) {
      const obj = keyBindings[name];
      const binding = (obj.key || '').toLowerCase();
      if (
        binding === key &&
        actions.includes(name) &&
        'action' in obj
      ) Acode.exec(obj.action);
    }

    registeredKey = null;
  }

  function saveState() {
    const lsEditor = [];
    const folders = [];
    const activeFile = editorManager.activeFile;
    const unsaved = [];

    for (let file of editorManager.files) {
      if (file.id === constants.DEFAULT_FILE_SESSION && !file.session.getValue()) continue;
      const edit = {};
      edit.name = file.filename;
      edit.type = file.type;
      edit.id = file.id;
      if (edit.type === 'git') edit.sha = file.record.sha;
      else if (edit.type === 'gist') {
        edit.recordid = file.record.id;
        edit.isNew = file.record.isNew;
      }
      if (file.uri) {
        edit.uri = file.uri;
        unsaved.push({
          id: btoa(file.id),
          uri: file.uri
        });
      }
      if (file.isUnsaved) {
        edit.data = file.session.getValue();
      }
      edit.cursorPos = editor.getCursorPosition();
      lsEditor.push(edit);
    }

    unsaved.map(file => {
      const protocol = new URL(file.uri).protocol;
      if (protocol === 'file:') {
        window.resolveLocalFileSystemURL(file.uri, fs => {
          window.resolveLocalFileSystemURL(CACHE_STORAGE, parent => {
            fs.copyTo(parent, file.id);
          }, err => {
            console.error(err);
          });
        }, err => {
          console.error(err);
        });
      }
    });

    addedFolder.map(folder => {
      const {
        url,
        reloadOnResume,
        saveState,
        title
      } = folder;
      folders.push({
        url,
        opts: {
          saveState,
          reloadOnResume,
          name: title
        }
      });
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

          document.body.setAttribute('data-small-msg', `Loading ${file.name}...`);

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
          } else if (file.uri) {

            if (file.data) xtra.saved = false;
            else xtra.saved = true;

            openFile(file.uri, xtra).then(index => {
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
        });
      } else {
        resolve();
      }
    });
  }

  function loadFolders() {
    try {
      const folders = JSON.parse(localStorage.getItem('folders'));
      folders.map(folder => openFolder(folder.url, folder.opts));
    } catch (error) {}
  }

  function checkFiles(e) {
    const files = editorManager.files;

    files.map(file => {
      if (file.type === 'git') return;
      if (file.uri) {
        const id = btoa(file.id);
        window.resolveLocalFileSystemURL(CACHE_STORAGE + id, entry => {
          fs.readFile(CACHE_STORAGE + id).then(res => {
            const data = res.data;
            const originalText = helpers.decodeText(data);

            fs.deleteFile(CACHE_STORAGE + id)
              .catch(err => {
                console.log(err);
              });

            fsOperation(file.uri)
              .then(fs => {
                return fs.readFile();
              })
              .then(data => {
                const text = helpers.decodeText(data);

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
              })
              .catch(err => {
                console.error(err);
                if (err.code === 1) editorManager.removeFile(file);
              });
          });
        }, err => {});
      }
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
      const cursorPos = editor.getCursorPosition();
      file.session.setValue(text);
      file.isUnsaved = false;
      editor.gotoLine(cursorPos.row, cursorPos.column);
      editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
      file.assocTile.classList.remove('notice');
      editorManager.onupdate();
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

  let theme = DOES_SUPPORT_THEME ? appSettings.value.appTheme : "default";
  let themeList = constants.appThemeList;
  let themeData = themeList[theme];

  if (
    !themeData ||
    (!themeData.isFree && IS_FREE_VERSION)
  ) {
    theme = "default";
    themeData = themeList[theme];
    appSettings.value.appTheme = theme;
    appSettings.update();
  }

  let hexColor = darken ? themeData.darken : themeData.primary;

  app.setAttribute('theme', theme);

  if (themeData.type === "dark") {
    NavigationBar.backgroundColorByHexString(hexColor, false);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  } else {

    StatusBar.backgroundColorByHexString(hexColor);

    if (theme === "default") {
      NavigationBar.backgroundColorByHexString(hexColor, false);
      StatusBar.styleLightContent();
    } else {
      NavigationBar.backgroundColorByHexString(hexColor, true);
      StatusBar.styleDefault();
    }

  }
}

function askForDonation() {
  if (localStorage.dontAskForDonation) return resetCount();

  const options = [
    [constants.PATREON, "Patreon", "patreon"],
    [constants.PAYPAL + "/5usd", "PayPal", "paypal"]
  ];

  if (IS_FREE_VERSION) options.push([constants.PAID_VERSION, "Download paid version", "googleplay"]);

  dialogs.select(strings["support text"], options, {
      onCancel: resetCount
    })
    .then(res => {
      localStorage.dontAskForDonation = true;
      window.open(res, '_system');
      resetCount();
    });
}

function resetCount() {
  localStorage.count = -10;
}

function askForRating() {
  if (!localStorage.dontAskForRating) rateBox();
}

function showWelcomeMessage() {
  localStorage.init = true;
  const backup = cordova.file.externalRootDirectory + constants.BACKUP_FILE;
  window.resolveLocalFileSystemURL(backup, fs => {
    dialogs.confirm(strings["welcome back"].toUpperCase(), strings['backup file found'])
      .then(() => {
        backupRestore.restore(backup);
      });
  }, err => {
    if (!BuildInfo.debug) {
      const title = strings.info.toUpperCase();
      const body = mustache.render($_hintText, {
        lang: appSettings.value.lang
      });
      dialogs
        .box(title, body)
        .wait(12000);
    }
  });
}

//#endregion