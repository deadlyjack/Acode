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
import './ace/modelist';
import 'core-js/stable';
import 'html-tag-js/dist/polyfill';
import tag from 'html-tag-js';
import mustache from 'mustache';
import git from './git';
import tile from '../components/tile';
import sidenav from '../components/sidenav';
import contextMenu from '../components/contextMenu';
import EditorManager from './editorManager';
import ActionStack from './actionStack';
import helpers from './utils/helpers';
import Settings from './settings';
import constants from './constants';
import intentHandler from './handlers/intent';
import openFolder from './openFolder';
import arrowkeys from './handlers/arrowkeys';
import commands from './commands';
import keyBindings from './keyBindings';
import quickTools from './handlers/quickTools';
import loadPolyFill from './utils/polyfill';
import Url from './utils/Url';
import applySettings from './applySettings';
import fsOperation from './fileSystem/fsOperation';
import run from './run';
import toast from '../components/toast';
import $_menu from '../views/menu.hbs';
import $_fileMenu from '../views/file-menu.hbs';
import Icon from '../components/icon';
import restoreTheme from './restoreTheme';
import openFiles from './openFiles';
import loadPlugins from './loadPlugins';
import pluginServer from './handlers/pluginServer';
import checkPluginsUpdate from './checkPluginsUpdate';
import plugins from '../pages/plugins/plugins';
import Acode from './acode';
import createPluginServer from './createPluginServer';

loadPolyFill.apply(window);
window.onload = Main;

async function Main() {
  const oldPreventDefault = TouchEvent.prototype.preventDefault;
  TouchEvent.prototype.preventDefault = function () {
    if (this.cancelable) {
      oldPreventDefault.bind(this)();
    }
  };

  window.addEventListener('resize', () => {
    if (window.ad?.shown && (innerHeight * devicePixelRatio) < 600) {
      ad.hide();
      return;
    }

    if (window.ad?.shown) {
      ad.show();
    }
  });
  document.addEventListener('deviceready', ondeviceready);
}

async function ondeviceready() {
  const language = navigator.language.toLowerCase();
  const oldRURL = window.resolveLocalFileSystemURL;
  const {
    externalCacheDirectory, //
    externalDataDirectory,
    cacheDirectory,
    dataDirectory,
  } = cordova.file;
  let lang = 'en-us';

  iap.startConnection();
  window.root = tag(window.root);
  window.app = tag(document.body);
  window.addedFolder = [];
  window.fileClipBoard = null;
  window.restoreTheme = restoreTheme;
  window.saveInterval = null;
  window.editorManager = null;
  window.toastQueue = [];
  window.toast = toast;
  window.ASSETS_DIRECTORY = Url.join(cordova.file.applicationDirectory, 'www');
  window.IS_FREE_VERSION = /(free)$/.test(BuildInfo.packageName);
  window.DATA_STORAGE = externalDataDirectory || dataDirectory;
  window.CACHE_STORAGE = externalCacheDirectory || cacheDirectory;
  window.PLUGIN_DIR = Url.join(DATA_STORAGE, 'plugins');
  window.KEYBINDING_FILE = Url.join(DATA_STORAGE, '.key-bindings.json');
  window.gitRecordFile = Url.join(DATA_STORAGE, 'git/.gitfiles');
  window.gistRecordFile = Url.join(DATA_STORAGE, 'git/.gistfiles');
  window.actionStack = ActionStack();
  window.appSettings = new Settings();

  try {
    if (!(await fsOperation(PLUGIN_DIR).exists())) {
      await fsOperation(DATA_STORAGE).createDirectory('plugins');
    }
  } catch (error) {
    console.error(error);
  }

  try {
    window.ANDROID_SDK_INT = await new Promise((resolve, reject) =>
      system.getAndroidVersion(resolve, reject),
    );
  } catch (error) {
    window.ANDROID_SDK_INT = parseInt(device.version);
  }
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
  window.acode = new Acode();

  system.requestPermission('android.permission.WRITE_EXTERNAL_STORAGE');
  localStorage.versionCode = BuildInfo.versionCode;
  document.body.setAttribute('data-version', 'v' + BuildInfo.version);
  acode.setLoadingMessage('Loading settings...');

  window.resolveLocalFileSystemURL = function (url, ...args) {
    oldRURL.call(this, Url.safe(url), ...args);
  };

  if (navigator.app && typeof navigator.app.clearCache === 'function') {
    navigator.app.clearCache();
  }

  setTimeout(() => {
    if (document.body.classList.contains('loading'))
      document.body.setAttribute(
        'data-small-msg',
        'This is taking unexpectedly long time!',
      );
  }, 1000 * 10);

  if (language in constants.langList) {
    lang = language;
  }
  acode.setLoadingMessage('Loading settings...');
  await appSettings.init(lang);

  if (localStorage.versionCode < 150) {
    localStorage.clear();
    appSettings.reset();
    window.location.reload();
  }

  try {
    acode.pluginServer = await createPluginServer();
    acode.pluginServer.setOnRequestHandler(pluginServer);
    acode.setLoadingMessage('Loading plugins...');
    loadPlugins()
      .then((numberOfPluginLoaded) => {
        if (numberOfPluginLoaded > 0) {
          toast(`${numberOfPluginLoaded} plugins loaded.`)
        }
      })
      .catch((error) => {
        console.error(error);
        toast('Plugins loading failed!');
      });
  } catch (error) {
    console.error(error);
    toast('Plugins loading failed!');
  }

  if (appSettings.value.showAd) {
    acode.exec('load-ad');
  } else {
    const loadAd = (value) => {
      appSettings.off('update:showAd', loadAd);
      if (value) {
        acode.exec('load-ad');
      }
    };
    appSettings.on('update:showAd', loadAd);
  }

  acode.setLoadingMessage('Loading custom theme...');
  document.head.append(
    tag('style', {
      id: 'custom-theme',
      textContent: helpers.jsonToCSS(
        constants.CUSTOM_THEME,
        appSettings.value.customTheme,
      ),
    }),
  );

  acode.setLoadingMessage('Loading language...');
  try {
    const languageFile = `${ASSETS_DIRECTORY}/lang/${appSettings.value.lang}.json`;
    const fs = fsOperation(languageFile);
    const text = await fs.readFile('utf-8');
    window.strings = helpers.parseJSON(text);
  } catch (error) {
    alert('Unable to load language file.');
  }

  acode.setLoadingMessage('Initializing GitHub...');
  await git.init();

  loadApp();
}

async function loadApp() {
  //#region declaration
  const $editMenuToggler = tag('span', {
    className: 'icon edit',
    attr: {
      style: 'font-size: 1.2em !important;',
      action: 'toggle-edit-menu',
    },
  });
  const $navToggler = tag('span', {
    className: 'icon menu',
    attr: {
      action: 'toggle-sidebar',
    },
  });
  const $menuToggler = Icon('more_vert', 'toggle-menu');
  const $header = tile({
    type: 'header',
    text: 'Acode',
    lead: $navToggler,
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
          file_eol: file.eol,
        }),
      );
    },
  });
  const $main = tag('main');
  const $sidebar = sidenav($main, $navToggler);
  const $runBtn = tag('span', {
    className: 'icon play_arrow',
    attr: {
      action: 'run',
    },
    onclick() {
      run();
    },
    oncontextmenu() {
      run.runFile();
    },
    style: {
      fontSize: '1.2em',
    },
  });
  const $floatingNavToggler = tag('span', {
    className: 'floating icon menu',
    id: 'sidebar-toggler',
    onclick() {
      acode.exec('toggle-sidebar');
    }
  });
  const $headerToggler = tag('span', {
    className: 'floating icon keyboard_arrow_left',
    id: 'header-toggler',
  });
  const $quickToolToggler = tag('span', {
    className: 'floating icon keyboard_arrow_up',
    id: 'quicktool-toggler',
  });
  const folders = helpers.parseJSON(localStorage.folders);
  const files = helpers.parseJSON(localStorage.files) || [];
  let registeredKey = '';
  //#endregion

  acode.$quickToolToggler = $quickToolToggler;
  acode.$headerToggler = $headerToggler;

  actionStack.onCloseApp = () => acode.exec('save-state');
  $sidebar.setAttribute('empty-msg', strings['open folder']);
  window.editorManager = await EditorManager($sidebar, $header, $main);

  const fmode = appSettings.value.floatingButtonActivation;
  const activationMode = fmode === 'long tap' ? 'oncontextmenu' : 'onclick';
  $headerToggler[activationMode] = function () {
    root.classList.toggle('show-header');
    this.classList.toggle('keyboard_arrow_left');
    this.classList.toggle('keyboard_arrow_right');
  };
  $quickToolToggler[activationMode] = function () {
    acode.exec('toggle-quick-tools');
  };

  //#region rendering
  applySettings.beforeRender();
  window.restoreTheme();
  root.append($header, $main, $footer, $floatingNavToggler, $headerToggler, $quickToolToggler);
  if (!appSettings.value.floatingButton) {
    root.classList.add('hide-floating-button');
  }
  applySettings.afterRender();
  //#endregion

  //#region loading-files
  acode.setLoadingMessage('Loading folders...');
  if (Array.isArray(folders)) {
    folders.forEach((folder) => openFolder(folder.url, folder.opts));
  }

  if (Array.isArray(files) && files.length) {
    acode.setLoadingMessage(`Loading files (0/${files.length})`);
    const res = await openFiles(files, (count) => {
      acode.setLoadingMessage(`Loading files (${count}/${files.length})`);
    });
    if (res.success === 0) {
      editorManager.addNewFile();
    }
    onEditorUpdate();
  } else {
    editorManager.addNewFile();
  }

  //#endregion
  setTimeout(() => {
    document.body.removeAttribute('data-small-msg');
    app.classList.remove('loading', 'splash');
  }, 1000);

  //#region Add event listeners
  editorManager.onupdate = onEditorUpdate;
  editorManager.on('rename-file', onRenameOrSwitchFile);
  editorManager.on('switch-file', onRenameOrSwitchFile);
  app.addEventListener('click', onClickApp);
  $fileMenu.addEventListener('click', handleMenu);
  $mainMenu.addEventListener('click', handleMenu);
  $footer.addEventListener('touchstart', footerTouchStart);
  $footer.addEventListener('contextmenu', footerOnContextMenu);
  document.addEventListener('backbutton', actionStack.pop);
  document.addEventListener('keydown', handleMainKeyDown);
  document.addEventListener('keyup', handleMainKeyUp);
  document.addEventListener('menubutton', $sidebar.toggle);
  navigator.app.overrideButton('menubutton', true);
  system.setIntentHandler(intentHandler, intentHandler.onError);
  system.getCordovaIntent(intentHandler, intentHandler.onError);
  $sidebar.onshow = function () {
    const activeFile = editorManager.activeFile;
    if (activeFile) editorManager.editor.blur();
  };
  document.addEventListener('pause', () => {
    acode.exec('save-state');
  });
  document.addEventListener('resume', () => {
    acode.exec('check-files');
  });
  //#endregion

  checkPluginsUpdate()
    .then((updates) => {
      if (!updates.length) return;
      const $icon = tag('span', {
        className: 'octicon octicon-bell',
        style: {
          fontSize: '1.2rem',
        },
        attr: {
          action: '',
        },
        onclick() {
          plugins(updates);
          this.remove();
        }
      });

      if ($editMenuToggler.isConnected) {
        $header.insertBefore($icon, $editMenuToggler);
      } else if ($runBtn.isConnected) {
        $header.insertBefore($icon, $runBtn);
      } else {
        $header.insertBefore($icon, $menuToggler);
      }
    })
    .catch(console.error);

  onRenameOrSwitchFile();

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

    const { editor } = editorManager;

    const isFocused = editor.textInput.getElement() === document.activeElement;
    if (key === 'escape' && (!actionStack.length || isFocused))
      e.preventDefault();
    if (actionStack.length || isFocused) return;
    for (let name in keyBindings) {
      const obj = keyBindings[name];
      const binding = (obj.key || '').toLowerCase();
      if (
        binding === key &&
        constants.COMMANDS.includes(name) &&
        'action' in obj
      )
        acode.exec(obj.action);
    }

    registeredKey = null;
  }

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
    acode.exec(action, value);
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
    editorManager.editor.focus();
  }

  function onEditorUpdate() {
    const activeFile = editorManager.activeFile;
    const $save = $footer.querySelector('[action=save]');

    if (!$editMenuToggler.isConnected) {
      $header.insertBefore($editMenuToggler, $header.lastChild);
    }

    if (activeFile) {
      if (activeFile.isUnsaved) {
        activeFile.assocTile.classList.add('notice');
        if ($save) $save.classList.add('notice');
      } else {
        activeFile.assocTile.classList.remove('notice');
        if ($save) $save.classList.remove('notice');
      }
    }

    acode.exec('save-state');
  }

  function onRenameOrSwitchFile() {
    run
      .checkRunnable()
      .then((res) => {
        if (res) {
          editorManager.activeFile.canRun = true;
          $runBtn.setAttribute('run-file', res);
          $header.insertBefore($runBtn, $header.lastChild);
        } else {
          editorManager.activeFile.canRun = false;
          $runBtn.removeAttribute('run-file');
          $runBtn.remove();
        }
      })
      .catch((err) => {
        $runBtn.removeAttribute('run-file');
        $runBtn.remove();
      });
  }
}

function onClickApp(e) {
  let el = e.target;
  if (el instanceof HTMLAnchorElement || checkIfInsideAncher()) {
    e.preventDefault();
    e.stopPropagation();

    system.openInBrowser(el.href);
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
}
