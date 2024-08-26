import 'core-js/stable';
import 'html-tag-js/dist/polyfill';

import 'styles/main.scss';
import 'styles/page.scss';
import 'styles/list.scss';
import 'styles/overrideAceStyle.scss';

import 'lib/polyfill';
import 'ace/supportedModes';
import 'components/WebComponents';

import Url from 'utils/Url';
import lang from 'lib/lang';
import Acode from 'lib/acode';
import themes from 'theme/list';
import mustache from 'mustache';
import startAd from 'lib/startAd';
import tile from 'components/tile';
import ajax from '@deadlyjack/ajax';
import helpers from 'utils/helpers';
import settings from 'lib/settings';
import $_menu from 'views/menu.hbs';
import plugins from 'pages/plugins';
import fsOperation from 'fileSystem';
import toast from 'components/toast';
import sidebarApps from 'sidebarApps';
import EditorFile from 'lib/editorFile';
import openFolder from 'lib/openFolder';
import checkFiles from 'lib/checkFiles';
import Sidebar from 'components/sidebar';
import actionStack from 'lib/actionStack';
import loadPolyFill from 'utils/polyfill';
import loadPlugins from 'lib/loadPlugins';
import tutorial from 'components/tutorial';
import intentHandler from 'handlers/intent';
import restoreFiles from 'lib/restoreFiles';
import $_fileMenu from 'views/file-menu.hbs';
import EditorManager from 'lib/editorManager';
import applySettings from 'lib/applySettings';
import keyboardHandler from 'handlers/keyboard';
import Contextmenu from 'components/contextmenu';
import otherSettings from 'settings/appSettings';
import windowResize from 'handlers/windowResize';
import quickToolsInit from 'handlers/quickToolsInit';
import checkPluginsUpdate from 'lib/checkPluginsUpdate';

import { initModes } from 'ace/modelist';
import { initFileList } from 'lib/fileList';
import { addedFolder } from 'lib/openFolder';
import { keydownState } from 'handlers/keyboard';
import { getEncoding, initEncodings } from 'utils/encodings';
import { setKeyBindings } from 'ace/commands';

const previousVersionCode = parseInt(localStorage.versionCode, 10);

window.onload = Main;

async function Main() {
  const oldPreventDefault = TouchEvent.prototype.preventDefault;

  ajax.response = (xhr) => {
    return xhr.response;
  };

  loadPolyFill.apply(window);

  TouchEvent.prototype.preventDefault = function () {
    if (this.cancelable) {
      oldPreventDefault.bind(this)();
    }
  };

  window.addEventListener('resize', windowResize);
  document.addEventListener('pause', pauseHandler);
  document.addEventListener('resume', resumeHandler);
  document.addEventListener('keydown', keyboardHandler);
  document.addEventListener('deviceready', onDeviceReady);
  document.addEventListener('backbutton', backButtonHandler);
  document.addEventListener('menubutton', menuButtonHandler);
}

async function onDeviceReady() {
  await initEncodings(); // important to load encodings before anything else

  const isFreePackage = /(free)$/.test(BuildInfo.packageName);
  const oldResolveURL = window.resolveLocalFileSystemURL;
  const {
    externalCacheDirectory, //
    externalDataDirectory,
    cacheDirectory,
    dataDirectory,
  } = cordova.file;

  window.app = document.body;
  window.root = tag.get('#root');
  window.addedFolder = addedFolder;
  window.editorManager = null;
  window.toast = toast;
  window.ASSETS_DIRECTORY = Url.join(cordova.file.applicationDirectory, 'www');
  window.DATA_STORAGE = externalDataDirectory || dataDirectory;
  window.CACHE_STORAGE = externalCacheDirectory || cacheDirectory;
  window.PLUGIN_DIR = Url.join(DATA_STORAGE, 'plugins');
  window.KEYBINDING_FILE = Url.join(DATA_STORAGE, '.key-bindings.json');
  window.IS_FREE_VERSION = isFreePackage;

  startAd();

  try {
    await helpers.promisify(iap.startConnection)
      .catch((e) => {
        console.error('connection error:', e);
      });

    if (localStorage.acode_pro === 'true') {
      window.IS_FREE_VERSION = false;
    }

    if (navigator.onLine) {
      const purchases = await helpers.promisify(iap.getPurchases);
      const isPro = purchases.find((p) => p.productIds.includes('acode_pro_new'));
      if (isPro) {
        window.IS_FREE_VERSION = false;
      } else {
        window.IS_FREE_VERSION = isFreePackage;
      }
    }
  } catch (error) {
    console.error('Purchase error:', error);
  }

  try {
    window.ANDROID_SDK_INT = await new Promise((resolve, reject) =>
      system.getAndroidVersion(resolve, reject),
    );
  } catch (error) {
    window.ANDROID_SDK_INT = parseInt(device.version);
  }
  window.DOES_SUPPORT_THEME = (() => {
    const $testEl = <div style={{
      height: `var(--test-height)`,
      width: `var(--test-height)`,
    }}></div>;
    document.body.append($testEl);
    const client = $testEl.getBoundingClientRect();

    $testEl.remove();

    if (client.height === 0) return false;
    else return true;
  })();
  window.acode = new Acode();

  system.requestPermission('android.permission.READ_EXTERNAL_STORAGE');
  system.requestPermission('android.permission.WRITE_EXTERNAL_STORAGE');

  const { versionCode } = BuildInfo;

  if (previousVersionCode !== versionCode) {
    system.clearCache();
  }

  if (!await fsOperation(PLUGIN_DIR).exists()) {
    await fsOperation(DATA_STORAGE).createDirectory('plugins');
  }

  localStorage.versionCode = versionCode;
  document.body.setAttribute('data-version', `v${BuildInfo.version} (${versionCode})`);
  acode.setLoadingMessage('Loading settings...');

  window.resolveLocalFileSystemURL = function (url, ...args) {
    oldResolveURL.call(this, Url.safe(url), ...args);
  };

  setTimeout(() => {
    if (document.body.classList.contains('loading'))
      document.body.setAttribute(
        'data-small-msg',
        'This is taking unexpectedly long time!',
      );
  }, 1000 * 10);

  acode.setLoadingMessage('Loading settings...');
  await settings.init();
  themes.init();

  acode.setLoadingMessage('Loading language...');
  await lang.set(settings.value.lang);

  try {
    await loadApp();
  } catch (error) {
    console.error(error);
    toast(`Error: ${error.message}`);
  } finally {
    setTimeout(() => {
      document.body.removeAttribute('data-small-msg');
      app.classList.remove('loading', 'splash');
      applySettings.afterRender();
    }, 500);
  }
}

async function loadApp() {
  let $mainMenu;
  let $fileMenu;
  const $editMenuToggler = <span className='icon edit' attr-action='toggle-edit-menu' style={{ fontSize: '1.2em' }} />;
  const $navToggler = <span className='icon menu' attr-action='toggle-sidebar'></span>;
  const $menuToggler = <span className='icon more_vert' attr-action='toggle-menu'></span>;
  const $header = tile({
    type: 'header',
    text: 'Acode',
    lead: $navToggler,
    tail: $menuToggler,
  });
  const $main = <main></main>;
  const $sidebar = <Sidebar container={$main} toggler={$navToggler} />;
  const $runBtn = <span style={{ fontSize: '1.2em' }} className='icon play_arrow' attr-action='run' onclick={() => acode.exec('run')} oncontextmenu={() => acode.exec('run-file')}></span>;
  const $floatingNavToggler = <span id='sidebar-toggler' className='floating icon menu' onclick={() => acode.exec('toggle-sidebar')}></span>;
  const $headerToggler = <span className='floating icon keyboard_arrow_left' id='header-toggler'></span>;
  const folders = helpers.parseJSON(localStorage.folders);
  const files = helpers.parseJSON(localStorage.files) || [];
  const editorManager = await EditorManager($header, $main);

  const setMainMenu = () => {
    if ($mainMenu) {
      $mainMenu.removeEventListener('click', handleMenu);
      $mainMenu.destroy();
    }
    const { openFileListPos, fullscreen } = settings.value;
    if (openFileListPos === settings.OPEN_FILE_LIST_POS_BOTTOM && fullscreen) {
      $mainMenu = createMainMenu({ bottom: '6px', toggler: $menuToggler });
    } else {
      $mainMenu = createMainMenu({ top: '6px', toggler: $menuToggler });
    }
    $mainMenu.addEventListener('click', handleMenu);
  };

  const setFileMenu = () => {
    if ($fileMenu) {
      $fileMenu.removeEventListener('click', handleMenu);
      $fileMenu.destroy();
    }
    const { openFileListPos, fullscreen } = settings.value;
    if (openFileListPos === settings.OPEN_FILE_LIST_POS_BOTTOM && fullscreen) {
      $fileMenu = createFileMenu({ bottom: '6px', toggler: $editMenuToggler });
    } else {
      $fileMenu = createFileMenu({ top: '6px', toggler: $editMenuToggler });
    }
    $fileMenu.addEventListener('click', handleMenu);
  };

  acode.$headerToggler = $headerToggler;
  window.actionStack = actionStack.windowCopy();
  window.editorManager = editorManager;
  setMainMenu(settings.value.openFileListPos);
  setFileMenu(settings.value.openFileListPos);
  actionStack.onCloseApp = () => acode.exec('save-state');
  $headerToggler.onclick = function () {
    root.classList.toggle('show-header');
    this.classList.toggle('keyboard_arrow_left');
    this.classList.toggle('keyboard_arrow_right');
  };

  //#region rendering
  applySettings.beforeRender();
  root.appendOuter($header, $main, $floatingNavToggler, $headerToggler);
  //#endregion

  //#region Add event listeners
  initModes();
  quickToolsInit();
  sidebarApps.init($sidebar);
  await sidebarApps.loadApps();
  editorManager.onupdate = onEditorUpdate;
  root.on('show', mainPageOnShow);
  app.addEventListener('click', onClickApp);
  editorManager.on('rename-file', onFileUpdate);
  editorManager.on('switch-file', onFileUpdate);
  editorManager.on('file-loaded', onFileUpdate);
  navigator.app.overrideButton('menubutton', true);
  system.setIntentHandler(intentHandler, intentHandler.onError);
  system.getCordovaIntent(intentHandler, intentHandler.onError);
  setTimeout(showTutorials, 1000);
  settings.on('update:openFileListPos', () => {
    setMainMenu();
    setFileMenu();
  });
  settings.on('update:fullscreen', () => {
    setMainMenu();
    setFileMenu();
  });


  $sidebar.onshow = function () {
    const activeFile = editorManager.activeFile;
    if (activeFile) editorManager.editor.blur();
  };
  sdcard.watchFile(KEYBINDING_FILE, async () => {
    await setKeyBindings(editorManager.editor);
    toast(strings['key bindings updated']);
  });
  //#endregion

  new EditorFile();

  checkPluginsUpdate()
    .then((updates) => {
      if (!updates.length) return;
      const $icon = <span onclick={
        () => {
          plugins(updates);
          $icon.remove();
        }
      } attr-action='' style={{ fontSize: '1.2rem' }} className='icon notifications'></span>;

      if ($editMenuToggler.isConnected) {
        $header.insertBefore($icon, $editMenuToggler);
      } else if ($runBtn.isConnected) {
        $header.insertBefore($icon, $runBtn);
      } else {
        $header.insertBefore($icon, $menuToggler);
      }
    })
    .catch(console.error);

  //load plugins
  try {
    await loadPlugins();
  } catch (error) {
    toast('Plugins loading failed!');
  }

  acode.setLoadingMessage('Loading folders...');
  if (Array.isArray(folders)) {
    folders.forEach((folder) => {
      folder.opts.listFiles = !!folder.opts.listFiles;
      openFolder(folder.url, folder.opts);
    });
  }

  if (Array.isArray(files) && files.length) {
    try {
      await restoreFiles(files);
    } catch (error) {
      console.error(error);
      toast('File loading failed!');
    }
  } else {
    onEditorUpdate(undefined, false);
  }

  initFileList();

  /**
   *
   * @param {MouseEvent} e
   */
  function handleMenu(e) {
    const $target = e.target;
    const action = $target.getAttribute('action');
    const value = $target.getAttribute('value') || undefined;
    if (!action) return;

    if ($mainMenu.contains($target)) $mainMenu.hide();
    if ($fileMenu.contains($target)) $fileMenu.hide();
    acode.exec(action, value);
  }

  function onEditorUpdate(mode, saveState = true) {
    const { activeFile } = editorManager;

    if (!$editMenuToggler.isConnected) {
      $header.insertBefore($editMenuToggler, $header.lastChild);
    }

    if (mode === 'switch-file') {
      if (settings.value.rememberFiles && activeFile) {
        localStorage.setItem('lastfile', activeFile.id);
      }
      return;
    }

    if (saveState) acode.exec('save-state');
  }

  async function onFileUpdate() {
    try {
      const { serverPort, previewPort } = settings.value;
      let canRun = false;
      if (serverPort !== previewPort) {
        canRun = true;
      } else {
        const { activeFile } = editorManager;
        canRun = await activeFile?.canRun();
      }

      if (canRun) {
        $header.insertBefore($runBtn, $header.lastChild);
      } else {
        $runBtn.remove();
      }
    } catch (error) {
      $runBtn.removeAttribute('run-file');
      $runBtn.remove();
    }
  }
}

function onClickApp(e) {
  let el = e.target;
  if (el instanceof HTMLAnchorElement || checkIfInsideAnchor()) {
    e.preventDefault();
    e.stopPropagation();

    system.openInBrowser(el.href);
  }

  function checkIfInsideAnchor() {
    const allAs = [...document.body.getAll('a')];

    for (let a of allAs) {
      if (a.contains(el)) {
        el = a;
        return true;
      }
    }

    return false;
  }
}

function mainPageOnShow() {
  const { editor } = editorManager;
  editor.resize(true);
}

function createMainMenu({ top, bottom, toggler }) {
  return Contextmenu({
    right: '6px',
    top,
    bottom,
    toggler,
    transformOrigin: top ? 'top right' : 'bottom right',
    innerHTML: () => {
      return mustache.render($_menu, strings);
    },
  });
}

function createFileMenu({ top, bottom, toggler }) {
  const $menu = Contextmenu({
    top,
    bottom,
    toggler,
    transformOrigin: top ? 'top right' : 'bottom right',
    innerHTML: () => {
      const file = window.editorManager.activeFile;

      if (file.loading) {
        $menu.classList.add('disabled');
      } else {
        $menu.classList.remove('disabled');
      }

      const { label: encoding } = getEncoding(file.encoding);

      return mustache.render($_fileMenu, {
        ...strings,
        file_mode: (file.session.getMode().$id || '').split('/').pop(),
        file_encoding: encoding,
        file_read_only: !file.editable,
        file_on_disk: !!file.uri,
        file_eol: file.eol,
        copy_text: !!window.editorManager.editor.getCopyText(),
      });
    },
  });

  return $menu;
}

function showTutorials() {
  if (window.innerWidth > 750) {
    tutorial('quicktools-tutorials', (hide) => {
      const onclick = () => {
        otherSettings();
        hide();
      };

      return <p>
        Quicktools has been <strong>disabled</strong> because it seems like you are on a bigger screen and probably using a keyboard.
        To enable it, <span className='link' onclick={onclick}>click here</span> or press <kbd>Ctrl + Shift + P</kbd> and search for <code>quicktools</code>.
      </p>;
    });
  }
}

function backButtonHandler() {
  if (keydownState.esc) {
    keydownState.esc = false;
    return;
  }
  actionStack.pop();
}

function menuButtonHandler() {
  const { acode } = window;
  acode?.exec('toggle-sidebar');
}

function pauseHandler() {
  const { acode } = window;
  acode?.exec('save-state');
}

function resumeHandler() {
  if (!settings.value.checkFiles) return;
  checkFiles();
}
