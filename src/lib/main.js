import 'core-js/stable';
import 'html-tag-js/dist/polyfill';

import 'styles/main.scss';
import 'styles/page.scss';
import 'styles/list.scss';
import 'styles/overrideAceStyle.scss';

import 'ace/modelist';
import 'ace/mode-smali';
import 'components/WebComponents';
import 'lib/polyfill';

import mustache from 'mustache';
import ajax from '@deadlyjack/ajax';
import tile from 'components/tile';
import Sidebar from 'components/sidebar';
import contextmenu from 'components/contextmenu';
import EditorManager from './editorManager';
import ActionStack from './actionStack';
import helpers from 'utils/helpers';
import settings from './settings';
import constants from './constants';
import intentHandler from 'handlers/intent';
import openFolder, { addedFolder } from './openFolder';
import quickToolsInit from 'handlers/quickToolsInit';
import loadPolyFill from 'utils/polyfill';
import Url from 'utils/Url';
import applySettings from './applySettings';
import fsOperation from 'fileSystem';
import toast from 'components/toast';
import $_menu from 'views/menu.hbs';
import $_fileMenu from 'views/file-menu.hbs';
import openFiles from './openFiles';
import loadPlugins from './loadPlugins';
import checkPluginsUpdate from './checkPluginsUpdate';
import plugins from 'pages/plugins';
import Acode from './acode';
import lang from './lang';
import EditorFile from './editorFile';
import sidebarApps from 'sidebarApps';
import checkFiles from './checkFiles';
import themes from './themes';
import { createEventInit } from 'utils/keyboardEvent';
import { resetKeyBindings, setKeyBindings } from 'ace/commands';
import { initFileList } from './fileList';
import QuickTools from 'pages/quickTools/quickTools';
import tutorial from 'components/tutorial';
import openFile from './openFile';
import startAd from './startAd';
import otherSettings from 'settings/appSettings';

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

  window.addEventListener('resize', () => {
    if (window.ad?.shown && (innerHeight * devicePixelRatio) < 600) {
      ad.hide();
      return;
    }

    if (window.ad?.shown) {
      ad.show();
    }
  });

  document.addEventListener('deviceready', onDeviceReady);
}

async function onDeviceReady() {

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
  const actionStack = new ActionStack();

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
  window.actionStack = actionStack;
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
  initFileList();
  createEventInit();
  quickToolsInit();
  sidebarApps.init($sidebar);
  await sidebarApps.loadApps();
  editorManager.onupdate = onEditorUpdate;
  root.on('show', mainPageOnShow);
  app.addEventListener('click', onClickApp);
  editorManager.on('rename-file', onFileUpdate);
  editorManager.on('switch-file', onFileUpdate);
  editorManager.on('file-loaded', onFileUpdate);
  document.addEventListener('backbutton', actionStack.pop);
  document.addEventListener('menubutton', $sidebar.toggle);
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
  document.addEventListener('pause', () => {
    acode.exec('save-state');
  });
  document.addEventListener('resume', () => {
    if (!settings.value.checkFiles) return;
    checkFiles();
  });
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
      } attr-action='' style={{ fontSize: '1.2rem' }} className='octicon octicon-bell'></span>;

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
    folders.forEach((folder) => openFolder(folder.url, folder.opts));
  }

  if (Array.isArray(files) && files.length) {
    openFiles(files)
      .then(() => {
        onEditorUpdate(undefined, false);
      })
      .catch((error) => {
        console.error(error);
        toast('File loading failed!');
      });
  } else {
    onEditorUpdate(undefined, false);
  }

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
  return contextmenu({
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
  const $menu = contextmenu({
    top,
    bottom,
    toggler,
    transformOrigin: top ? 'top right' : 'bottom right',
    innerHTML: () => {
      const file = editorManager.activeFile;

      if (file.loading) {
        $menu.classList.add('disabled');
      } else {
        $menu.classList.remove('disabled');
      }

      return mustache.render($_fileMenu, {
        ...strings,
        file_mode: (file.session.getMode().$id || '').split('/').pop(),
        file_encoding: file.encoding,
        file_read_only: !file.editable,
        file_info: !!file.uri,
        file_eol: file.eol,
        copy_text: !!editorManager.editor.getCopyText(),
        new_file: file.name === constants.DEFAULT_FILE_NAME && !file.session.getValue(),
      });
    },
  });

  return $menu;
}

function showTutorials() {
  tutorial('main-tutorials', (hide) => {
    const onclick = () => {
      QuickTools();
      hide();
    };

    return <p>
      Command palette icon has been removed from shortcuts, but you can modify shortcuts.
      <span className='link' onclick={onclick}>Click here</span> to configure quick tools.
    </p>;
  });

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

  if (previousVersionCode < 284) {
    tutorial('keybinding-tutorials', (hide) => {
      const reset = () => {
        resetKeyBindings();
        hide();
      };

      const edit = () => {
        openFile(KEYBINDING_FILE);
        hide();
      };

      return <p>
        Keybinding file is misconfigured. Please <span className='link' onclick={edit}>edit</span> or <span className='link' onclick={reset}>reset</span> it.
        There was a typo in keybinding file. Search 'pallete' and replace it with 'palette'.
      </p>;
    });
  }
}
