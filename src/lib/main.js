import '../styles/main.scss';
import '../styles/themes.scss';
import '../styles/page.scss';
import '../styles/list.scss';
import '../styles/sidenav.scss';
import '../styles/tile.scss';
import '../styles/contextMenu.scss';
import '../styles/dialogs.scss';
import '../styles/help.scss';
import '../styles/overrideAceStyle.scss';
import 'core-js/stable';
import 'html-tag-js/dist/polyfill';
import Irid from 'irid';
import tag from 'html-tag-js';
import mustache from 'mustache';
import git from './git';
import tile from '../components/tile';
import sidenav from '../components/sidenav';
import contextMenu from '../components/contextMenu';
import EditorManager from './editorManager';
import internalFs from './fileSystem/internalFs';
import ActionStack from './actionStack';
import helpers from './utils/helpers';
import Settings from './settings';
import dialogs from '../components/dialogs';
import constants from './constants';
import intentHandler from './handlers/intent';
import openFolder from './openFolder';
import arrowkeys from './handlers/arrowkeys';
import commands from './commands';
import keyBindings from './keyBindings';
import quickTools from './handlers/quickTools';
import rateBox from '../components/dialogboxes/rateBox';
import loadPolyFill from './utils/polyfill';
import Url from './utils/Url';
import applySettings from './applySettings';
import fsOperation from './fileSystem/fsOperation';
import ajax from './utils/ajax';
import runPreview from './runPreview';
import toast from '../components/toast';
import $_menu from '../views/menu.hbs';
import $_fileMenu from '../views/file-menu.hbs';
import $_hintText from '../views/hint-txt.hbs';

loadPolyFill.apply(window);
window.onload = Main;

function Main() {
  let timeout,
    alert = window.alert;
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
    url: 'https://acode.foxdebug.com/api/getad',
    responseType: 'json',
  })
    .then((res) => {
      window.ad = res;
      if (res.image) {
        return ajax({
          url: res.image,
          responseType: 'arraybuffer',
        });
      } else {
        return Promise.resolve(res);
      }
    })
    .then((res) => {
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
    activeFile: null,
  };
  window.customKeyBindings = null;
  window.defaultKeyBindings = keyBindings;
  window.keyBindings = (name) => {
    if (customKeyBindings && name in window.customKeyBindings)
      return window.customKeyBindings[name].key;
    else if (name in defaultKeyBindings) return defaultKeyBindings[name].key;
    else return null;
  };

  document.addEventListener('deviceready', () => {
    system.clearCache(
      () => {},
      (err) => console.error(err)
    );

    const oldRURL = window.resolveLocalFileSystemURL;

    window.resolveLocalFileSystemURL = function (url, ...args) {
      oldRURL.call(this, Url.safe(url), ...args);
    };

    if (!BuildInfo.debug) {
      setTimeout(() => {
        if (document.body.classList.contains('loading'))
          alert(
            'Something went wrong! Please clear app data and restart the app or wait.'
          );
      }, 1000 * 30);
    }

    setTimeout(() => {
      if (document.body.classList.contains('loading'))
        document.body.setAttribute(
          'data-small-msg',
          'This is taking unexpectedly long time!'
        );
    }, 1000 * 10);

    window.toastQueue = [];
    window.toast = toast;
    window.IS_FREE_VERSION = /(free)$/.test(BuildInfo.packageName);
    window.DATA_STORAGE =
      cordova.file.externalDataDirectory || cordova.file.dataDirectory;
    window.TEMP_STORAGE = DATA_STORAGE + 'tmp/';
    window.CACHE_STORAGE =
      cordova.file.externalCacheDirectory || cordova.file.cacheDirectory;
    window.SFTP_CACHE = Url.join(CACHE_STORAGE, 'sftp');
    window.KEYBINDING_FILE = DATA_STORAGE + '.key-bindings.json';
    window.gitRecordURL = DATA_STORAGE + 'git/.gitfiles';
    window.gistRecordURL = DATA_STORAGE + 'git/.gistfiles';
    window.IS_ANDROID_VERSION_5 = /^5/.test(device.version);
    window.DOES_SUPPORT_THEME = (() => {
      const $testEl = tag('div', {
        style: {
          height: `var(--test-height)`,
          width: `var(--test-height)`,
        },
      });
      document.body.append($testEl);
      const client = $testEl.getBoundingClientRect();

      $testEl.remove();

      if (client.height === 0) return false;
      else return true;
    })();

    fsOperation(TEMP_STORAGE)
      .then((fs) => {
        return fs.deleteDir();
      })
      .finally(() => {
        fsOperation(DATA_STORAGE).then((fs) => {
          fs.createDirectory('tmp/');
        });
      });

    document.body.setAttribute('data-version', 'v' + BuildInfo.version);

    const permissions = cordova.plugins.permissions;
    const requiredPermissions = [permissions.WRITE_EXTERNAL_STORAGE];

    requiredPermissions.map((permission, i) =>
      permissions.checkPermission(permission, (status) => success(status, i))
    );

    function success(status, i) {
      if (!status.hasPermission) {
        permissions.requestPermission(requiredPermissions[i], () => {});
      }
    }

    document.body.setAttribute('data-small-msg', 'Loading settings...');
    window.appSettings = new Settings(lang);
    if (appSettings.loaded) {
      ondeviceready();
    } else {
      appSettings.onload = ondeviceready;
    }
  });

  function ondeviceready() {
    if (!('files' in localStorage)) {
      // localStorage.files = '[]';
    }
    if (!('folders' in localStorage)) {
      localStorage.folders = '[]';
    }

    document.head.append(
      tag('style', {
        id: 'custom-theme',
        textContent: helpers.jsonToCSS(
          constants.CUSTOM_THEME,
          appSettings.value.customTheme
        ),
      })
    );

    if (!window.loaded) window.loaded = true;
    else return;

    const languageFile = `${cordova.file.applicationDirectory}www/lang/${appSettings.value.lang}.json`;

    document.body.setAttribute('data-small-msg', 'Loading modules...');
    internalFs
      .readFile(KEYBINDING_FILE)
      .then((res) => {
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
        document.body.setAttribute('data-small-msg', 'Loading editor...');
        loadAceEditor()
          .then(() => {
            ace.config.set('basePath', './res/ace/src/');
            window.modelist = ace.require('ace/ext/modelist');
            window.AceMouseEvent = ace.require(
              'ace/mouse/mouse_event'
            ).MouseEvent;
            return internalFs.readFile(languageFile);
          })
          .then((res) => {
            const text = helpers.decodeText(res.data);
            window.strings = JSON.parse(text);
            initGit();
          })
          .catch((err) => {
            helpers.error(err);
            console.error(err);
          });
      });
  }

  function initGit() {
    timeout = setTimeout(initGit, 1000);

    git
      .init()
      .then(() => {
        if (timeout) clearTimeout(timeout);
        return internalFs.listDir(
          cordova.file.applicationDirectory + 'www/css/build/'
        );
      })
      .then((entries) => {
        const styles = [];
        entries.map((entry) => styles.push(entry.nativeURL));
        return helpers.loadStyles(...styles);
      })
      .then((res) => {
        runApp();
      })
      .catch((err) => {
        if (timeout) clearTimeout(timeout);
        console.error(err);
      });
  }
}

function loadAceEditor() {
  const aceScript = [
    './res/ace/src/ace.js',
    './res/ace/emmet-core.js',
    './res/ace/src/ext-language_tools.js',
    './res/ace/src/ext-code_lens.js',
    './res/ace/src/ext-emmet.js',
    './res/ace/src/ext-beautify.js',
    './res/ace/src/ext-modelist.js',
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
    $editMenuToggler: null,
  };

  window.Acode = Acode;
  document.addEventListener('backbutton', actionStack.pop);
  window.beautify = ace.require('ace/ext/beautify').beautify;

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
      action: '',
    },
  });
  const $toggler = tag('span', {
    className: 'icon menu',
    attr: {
      action: 'toggle-sidebar',
    },
  });
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu',
    },
  });
  const $header = tile({
    type: 'header',
    text: 'Acode',
    lead: $toggler,
    tail: $menuToggler,
  });
  const $footer = tag('footer', {
    id: 'quick-tools',
    tabIndex: -1,
    onclick: quickTools.clickListener,
  });
  const $mainMenu = contextMenu({
    top: '6px',
    right: '6px',
    toggle: $menuToggler,
    transformOrigin: 'top right',
    innerHTML: () => {
      return mustache.render($_menu, strings);
    },
  });
  const $fileMenu = contextMenu({
    toggle: $editMenuToggler,
    top: '6px',
    transformOrigin: 'top right',
    innerHTML: () => {
      const file = editorManager.activeFile;
      return mustache.render(
        $_fileMenu,
        Object.assign(strings, {
          file_mode: (file.session.getMode().$id || '').split('/').pop(),
          file_encoding: file.encoding,
          file_read_only: !file.editable,
          file_info: !!file.uri,
        })
      );
    },
  });
  const $main = tag('main');
  const $sidebar = sidenav($main, $toggler);
  const $runBtn = tag('span', {
    className: 'icon play_arrow',
    attr: {
      action: 'run-file',
    },
    onclick: () => {
      Acode.exec('run');
    },
    style: {
      fontSize: '1.2em',
    },
  });
  const $headerToggler = tag('span', {
    className: 'floating icon keyboard_arrow_left',
    id: 'header-toggler',
  });
  const $quickToolToggler = tag('span', {
    className: 'floating icon keyboard_arrow_up',
    id: 'quicktool-toggler',
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
  const activationMode = fmode === 'long tap' ? 'oncontextmenu' : 'onclick';
  $headerToggler[activationMode] = function () {
    root.classList.toggle('show-header');
    this.classList.toggle('keyboard_arrow_left');
    this.classList.toggle('keyboard_arrow_right');
  };
  $quickToolToggler[activationMode] = function () {
    Acode.exec('toggle-quick-tools');
  };

  //#region rendering
  applySettings.beforeRender();
  window.restoreTheme();
  root.append($header, $main, $footer, $headerToggler, $quickToolToggler);
  if (!appSettings.value.floatingButton)
    root.classList.add('hide-floating-button');
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
  document.body.setAttribute('data-small-msg', 'Loading files...');
  loadFiles().then(() => {
    document.body.removeAttribute('data-small-msg');

    setTimeout(() => {
      app.classList.remove('loading', 'splash');
      onAppLoad();
    }, 500);

    window.plugins.intent.setNewIntentHandler(intentHandler);
    window.plugins.intent.getCordovaIntent(intentHandler, function (e) {
      console.error('Error: Cannot handle open with file intent', e);
    });
    document.addEventListener('menubutton', $sidebar.toggle);
    navigator.app.overrideButton('menubutton', true);
    document.addEventListener('pause', () => {
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

      runPreview
        .checkRunnable()
        .then((res) => {
          if (res) {
            $runBtn.setAttribute('run-file', res);
            $header.insertBefore($runBtn, $header.lastChild);
          } else {
            $runBtn.removeAttribute('run-file');
            $runBtn.remove();
          }
        })
        .catch((err) => {
          $runBtn.removeAttribute('run-file');
          $runBtn.remove();
        });
    }

    if (doSaveState) saveState();
  };

  window.getCloseMessage = function () {
    const numFiles = editorManager.hasUnsavedFiles();
    if (numFiles) {
      return strings['unsaved files close app'];
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
    if (key === 'escape' && (!actionStack.length || isFocused))
      e.preventDefault();
    if (actionStack.length || isFocused) return;
    for (let name in keyBindings) {
      const obj = keyBindings[name];
      const binding = (obj.key || '').toLowerCase();
      if (binding === key && actions.includes(name) && 'action' in obj)
        Acode.exec(obj.action);
    }

    registeredKey = null;
  }

  function saveState() {
    const lsEditor = [];
    const folders = [];
    const activeFile = editorManager.activeFile;

    for (let file of editorManager.files) {
      if (
        file.id === constants.DEFAULT_FILE_SESSION &&
        !file.session.getValue()
      ) {
        continue;
      }

      const edit = {
        id: file.id,
        filename: file.filename,
        type: file.type,
        uri: file.uri,
        isUnsaved: file.isUnsaved,
        readOnly: file.readOnly,
        cursorPos: editor.getCursorPosition(),
      };

      if (edit.type === 'git') edit.sha = file.record.sha;
      else if (edit.type === 'gist') {
        edit.recordid = file.record.id;
        edit.isNew = file.record.isNew;
      }

      lsEditor.push(edit);
    }

    addedFolder.map((folder) => {
      const { url, reloadOnResume, saveState, title } = folder;
      folders.push({
        url,
        opts: {
          saveState,
          reloadOnResume,
          name: title,
        },
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
      (async () => {
        const files = helpers.parseJSON(localStorage.files) || [];
        const lastfile = localStorage.lastfile;

        for (let file of files) {
          let text = '';
          const {
            cursorPos, //
            isUnsaved,
            filename,
            type,
            uri,
            id,
            readOnly,
          } = file;
          const render = files.length === 1 || id === lastfile;

          try {
            const fs = await fsOperation(Url.join(CACHE_STORAGE, id));
            text = await fs.readFile('utf-8');
          } catch (error) {}

          document.body.setAttribute(
            'data-small-msg',
            `Loading ${filename}...`
          );

          if (type === 'git') {
            gitRecord.get(file.sha).then((record) => {
              if (record) {
                editorManager.addNewFile(filename, {
                  type: 'git',
                  text: text || record.data,
                  isUnsaved: isUnsaved,
                  record,
                  render,
                  cursorPos,
                  id,
                });
              }
            });
          } else if (type === 'gist') {
            const gist = gistRecord.get(file.recordid, file.isNew);
            if (gist) {
              const gistFile = gist.files[filename];
              editorManager.addNewFile(filename, {
                type: 'gist',
                text: text || gistFile.content,
                isUnsaved,
                record: gist,
                render,
                cursorPos,
                id,
              });
            }
          } else if (uri) {
            if (!text) {
              const fs = await fsOperation(uri);
              text = await fs.readFile('utf-8');
            }
            editorManager.addNewFile(filename, {
              uri,
              render,
              isUnsaved,
              cursorPos,
              readOnly,
              text,
              id,
            });
          } else {
            editorManager.addNewFile(filename, {
              render,
              isUnsaved,
              cursorPos,
              text,
              id,
            });
          }
        }

        resolve();
      })();
    });
  }

  function loadFolders() {
    try {
      const folders = JSON.parse(localStorage.getItem('folders'));
      folders.map((folder) => openFolder(folder.url, folder.opts));
    } catch (error) {}
  }

  async function checkFiles(e) {
    const files = editorManager.files;

    for (let file of files) {
      if (file.type === 'git') return;

      if (file.uri) {
        const fs = await fsOperation(file.uri);

        if (!(await fs.exists())) {
          file.location = null;
          file.isUnsaved = true;
          dialogs.alert(
            strings.info.toUpperCase(),
            strings['file has been deleted'].replace('{file}', file.filename)
          );
          editorManager.onupdate();
          continue;
        }

        const text = await fs.readFile('utf-8');
        const loadedText = file.session.getValue();

        if (text !== loadedText) {
          try {
            await dialogs.confirm(
              strings.warning.toUpperCase(),
              file.filename + strings['file changed']
            );

            const cursorPos = editor.getCursorPosition();
            editorManager.switchFile(file.id);

            file.markChanged = false;
            file.session.setValue(text);
            editor.gotoLine(cursorPos.row, cursorPos.column);
            editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
          } catch (error) {}
        }
      }
    }

    if (!editorManager.activeFile) {
      app.focus();
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
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;
    e.preventDefault();
    editor.focus();
  }
}

//#region global funtions

function restoreTheme(darken) {
  if (darken && document.body.classList.contains('loading')) return;

  let theme = DOES_SUPPORT_THEME ? appSettings.value.appTheme : 'default';
  const themeList = constants.appThemeList;
  let themeData = themeList[theme];
  let type = themeData.type;

  if (!themeData || (!themeData.isFree && IS_FREE_VERSION)) {
    theme = 'default';
    themeData = themeList[theme];
    appSettings.value.appTheme = theme;
    appSettings.update();
  }

  if (type === 'custom') {
    const color = appSettings.value.customTheme['--primary-color'];
    themeData.primary = Irid(color).toHexString();
    themeData.darken = Irid(themeData.primary).darken(0.4).toHexString();

    type = appSettings.value.customThemeMode;
  }

  let hexColor = darken ? themeData.darken : themeData.primary;

  app.setAttribute('theme', theme);

  if (type === 'dark') {
    NavigationBar.backgroundColorByHexString(hexColor, false);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  } else {
    StatusBar.backgroundColorByHexString(hexColor);

    if (theme === 'default') {
      NavigationBar.backgroundColorByHexString(hexColor, false);
      StatusBar.styleLightContent();
    } else {
      NavigationBar.backgroundColorByHexString(hexColor, true);
      StatusBar.styleDefault();
    }
  }

  document.body.setAttribute('theme-type', type);
}

function askForDonation() {
  if (localStorage.dontAskForDonation) return resetCount();

  //TODO: Add currency to donate
  const options = [[constants.PAYPAL + '/5usd', 'PayPal', 'paypal']];

  if (IS_FREE_VERSION)
    options.push([
      constants.PAID_VERSION,
      'Download paid version',
      'googleplay',
    ]);

  dialogs
    .select(strings['support text'], options, {
      onCancel: resetCount,
    })
    .then((res) => {
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
  if (!BuildInfo.debug) {
    const title = strings.info.toUpperCase();
    const body = mustache.render($_hintText, {
      lang: appSettings.value.lang,
    });
    dialogs.box(title, body).wait(12000);
  }
}

//#endregion
