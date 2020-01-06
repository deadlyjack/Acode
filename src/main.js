import "./styles/index.scss";
import "./styles/page.scss";
import './styles/list.scss';
import './styles/sidenav.scss';
import './styles/tile.scss';
import './styles/contextMenu.scss';
import './styles/dialogs.scss';
import './styles/themes.scss';
import './styles/help.scss';
import './styles/overideAceStyle.scss';

import "core-js/stable";
import tag from 'html-tag-js';
import mustache from 'mustache';
import mimeType from 'mime-types';
import tile from "./components/tile";
import sidenav from './components/sidenav';
import contextMenu from './components/contextMenu';
import EditorManager from './modules/editorManager';
import fs from './modules/utils/androidFileSystem';
import ActionStack from "./modules/actionStack";
import helpers from "./modules/helpers";
import Settings from "./settings";
import dialogs from "./components/dialogs";
import constants from "./constants";
import HandleIntent from "./modules/handleIntent";
import createEditorFromURI from "./modules/createEditorFromURI";
import addFolder from "./modules/addFolder";
import menuHandler from "./modules/menuHandler";
import quickToolAction from "./modules/events/quicktools";
import arrowkeys from "./modules/events/arrowkeys";
// import gitHub from "./modules/gitHub";

import $_menu from './views/menu.hbs';
import $_row1 from './views/footer/row1.hbs';
import $_row2 from './views/footer/row2.hbs';
import $_search from './views/footer/search.hbs';
import saveFile from "./modules/saveFile";
import git from "./modules/git";
//@ts-check

window.onload = Main;

function Main() {
  let timeout;
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

  window.actionStack = ActionStack();
  window.editorCount = 0;
  window.alert = dialogs.alert;
  window.addedFolder = {};
  window.fileClipBoard = null;
  window.isLoading = true;
  window.restoreTheme = restoreTheme;
  window.getCloseMessage = () => {};
  window.beforeClose = null;
  window.saveInterval = null;
  window.editorManager = {
    files: [],
    activeFile: null
  }

  if (!('files' in localStorage)) {
    localStorage.setItem('files', '[]');
  }
  if (!('folders' in localStorage)) {
    localStorage.setItem('folders', '[]');
  }

  document.addEventListener("deviceready", () => {

    const permissions = cordova.plugins.permissions;
    const requiredPermissions = [
      permissions.WRITE_EXTERNAL_STORAGE,
      permissions.WRITE_MEDIA_STORAGE,
      permissions.MANAGE_DOCUMENTS
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
    const url = `${cordova.file.applicationDirectory}www/lang/${appSettings.value.lang}.json`;
    window.gitRecordURL = cordova.file.externalDataDirectory + 'git/.gitfiles';
    fs.readFile(url)
      .then(res => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(res.data);
        window.strings = JSON.parse(text);
        initGit();
      })
      .catch(err => {
        console.log(err);
      });
  }

  function initGit() {

    timeout = setTimeout(initGit, 1000);

    git.init()
      .then(res => {
        if (timeout) clearTimeout(timeout);
        window.gitRecord = res;
        runApp();
      })
      .catch(err => {
        if (timeout) clearTimeout(timeout);
        console.log(err);
      });
  }
}

function runApp() {
  document.body.addEventListener('click', function (e) {
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

  document.body = tag(document.body);
  window.app = document.body;
  document.addEventListener('backbutton', backButton);
  window.beautify = ace.require("ace/ext/beautify").beautify;

  new App();

  function backButton() {
    if (window.freeze) return;
    actionStack.pop();
  }
}

function App() {
  //#region declaration
  const _search = mustache.render($_search, strings);
  const $toggler = tag('span', {
    className: 'icon menu'
  });
  const $menuToggler = tag("span", {
    className: 'icon more_vert'
  });
  const $header = tile({
    type: 'header',
    text: 'Acode',
    lead: $toggler,
    tail: $menuToggler
  });
  const $footer = tag('footer', {
    innerHTML: mustache.render($_row1, strings)
  });

  const $mainMenu = contextMenu(mustache.render($_menu, strings), {
    top: '6px',
    right: '6px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });

  const $main = tag('main');
  const $sidebar = sidenav($main, $toggler);
  const $runBtn = tag('span', {
    className: 'icon play_arrow',
    onclick: runPreview.bind($runBtn, editorManager),
    style: {
      fontSize: '1.2em'
    }
  });
  const fileOptions = {
    save: $mainMenu.querySelector('[action=save]'),
    saveAs: $mainMenu.querySelector('[action=saveAs]'),
    goto: $mainMenu.querySelector('[action=goto]')
  }

  window.editorManager = EditorManager($sidebar, $header, $main);
  const editor = editorManager.editor;
  //#endregion

  //#region initialization
  window.restoreTheme();
  $main.setAttribute("data-empty-msg", strings['no editor message']);

  //#endregion

  //#region rendering
  $header.classList.add('light');
  app.append($header, $main);
  //#endregion

  $mainMenu.addEventListener('click', handleMenu);
  $footer.addEventListener('click', handleFooter);
  $footer.addEventListener('touchstart', footerTouchStart);
  $footer.addEventListener('contextmenu', footerOnContextMenu);

  setTimeout(() => {
    loadFiles()
      .then(loadFolders)
      .then(() => {
        setTimeout(() => {
          document.body.classList.remove('loading', 'splash');
          window.isLoading = false;
          localStorage.removeItem('files');
          localStorage.removeItem('folders');
          localStorage.removeItem('lastfile');
        }, 500);
        //#region event listeners 
        if (cordova.platformId === 'android') {
          window.plugins.intent.setNewIntentHandler(HandleIntent);
          window.plugins.intent.getCordovaIntent(HandleIntent, function (e) {
            console.log("Error: Cannot handle open with file intent", e);
          });
          document.addEventListener('menubutton', $sidebar.toggle);
          navigator.app.overrideButton("menubutton", true);
        }

        document.addEventListener('pause', window.beforeClose);
        document.addEventListener('resume', checkFiles);
        checkFiles();

        const autosave = parseInt(appSettings.value.autosave);
        if (autosave) {
          saveInterval = setInterval(() => {
            editorManager.files.map(file => {
              if (file.isUnsaved && file.location) saveFile(file, undefined, false);
            });
          }, autosave);
        }
      });
  }, 100);

  editorManager.onupdate = function () {
    /**
     * @type {File}
     */
    const activeFile = this.activeFile;
    const $save = $footer.querySelector('[action=save]');

    if (!$footer.parentElement && activeFile) {
      app.classList.add('bottom-bar');
      app.append($footer);
    }

    if (!activeFile) {
      fileOptions.save.classList.add('disabled');
      fileOptions.saveAs.classList.add('disabled');
      fileOptions.goto.classList.add('disabled');
      app.classList.remove('bottom-bar');
      $footer.remove();
      $runBtn.remove();
    } else if (activeFile) {
      fileOptions.saveAs.classList.remove('disabled');
      fileOptions.goto.classList.remove('disabled');

      if (!activeFile.readOnly) {
        fileOptions.save.classList.remove('disabled');
        $save.classList.remove('disabled');
      } else {
        fileOptions.save.classList.add('disabled');
        $save.classList.add('disabled');
      }

      if (activeFile.isUnsaved) {
        activeFile.assocTile.classList.add('notice');
        $save.classList.add('notice');
      } else {
        activeFile.assocTile.classList.remove('notice');
        $save.classList.remove('notice');
      }

      if (['html', 'htm', 'xhtml'].includes(helpers.getExt(activeFile.filename))) {
        $header.insertBefore($runBtn, $header.lastChild);
      } else {
        $runBtn.remove();
      }
    }
  };

  window.beforeClose = function () {
    if (!editorManager) return;

    const lsEditor = [];
    const allFolders = Object.keys(addedFolder);
    const folders = [];
    const activeFile = editorManager.activeFile;
    const unsaved = [];

    for (let file of editorManager.files) {
      const edit = {};
      edit.name = file.filename;
      edit.type = file.type;
      if (edit.type === 'git') edit.sha = file.record.sha;
      if (file.fileUri) {
        edit.fileUri = file.fileUri;
        edit.readOnly = file.readOnly ? 'true' : '';
        unsaved.push({
          id: btoa(file.id),
          fileUri: file.fileUri
        });
      } else if (file.contentUri) {
        edit.contentUri = file.contentUri;
        edit.readOnly = true;
      }
      if (file.isUnsaved) {
        edit.data = file.session.getValue();
      }
      edit.cursorPos = editorManager.editor.getCursorPosition();
      lsEditor.push(edit);
    }

    unsaved.map(file => {
      window.resolveLocalFileSystemURL(file.fileUri, fs => {
        const extDir = cordova.file.externalCacheDirectory;
        window.resolveLocalFileSystemURL(extDir, parent => {
          fs.copyTo(parent, file.id);
        }, err => {
          console.error(err);
        });
      }, err => {
        console.error(err);
      });
    });

    allFolders.map(folder => {
      folders.push({
        url: folder,
        name: addedFolder[folder].name
      });
    });

    if (activeFile) {
      localStorage.setItem('lastfile', activeFile.fileUri || activeFile.contentUri || activeFile.filename);
    }

    localStorage.setItem('files', JSON.stringify(lsEditor));
    localStorage.setItem('folders', JSON.stringify(folders));
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

  function loadFiles() {
    return new Promise((resolve) => {
      if ('files' in localStorage && localStorage.files !== '[]') {
        /**
         * @type {storedFiles[]}
         */
        const files = JSON.parse(localStorage.getItem('files'));
        const lastfile = localStorage.getItem('lastfile') || files.slice(-1)[0].url;
        files.map((file, i) => {

          const xtra = {
            text: file.data,
            cursorPos: file.cursorPos,
            saved: false,
            render: false,
            readOnly: !!file.readOnly,
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
                    record
                  });
                }
                if (i === files.length - 1) resolve();
              });
          } else if (file.fileUri) {

            if (file.fileUri === lastfile) {
              xtra.render = true;
            }
            if (file.data) {
              xtra.saved = false;
            } else {
              xtra.saved = true;
            }

            createEditorFromURI(file.fileUri, false, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });
          } else if (file.contentUri) {

            if (file.contentUri === lastfile) {
              xtra.render = true;
            }

            createEditorFromURI({
              name: file.name,
              dir: file.contentUri,
            }, true, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });

          } else {
            const render = file.name === lastfile;
            const newFile = editorManager.addNewFile(file.name, {
              render,
              isUnsaved: !!file.data
            });
            if (file.data) {
              newFile.session.insert(file.cursorPos, file.data);
              newFile.session.setUndoManager(new ace.UndoManager());
            }

            if (i === files.length - 1) resolve();
          }
        });
      } else {
        editorManager.addNewFile('untitled', {
          isUnsaved: false,
          render: true
        });
        resolve();
      }
    });
  }

  function loadFolders() {
    return new Promise(resolve => {
      if ('folders' in localStorage && localStorage.folders !== '[]') {
        const folders = JSON.parse(localStorage.getItem('folders'));
        folders.map((folder, i) => {
          addFolder(folder, $sidebar, i).then(index => {
            if (index === folders.length - 1) resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }

  function checkFiles(e) {
    if (e) {
      for (let key in addedFolder) {
        addedFolder[key].reload();
      }
    }
    const files = editorManager.files;

    const dir = cordova.file.externalCacheDirectory;
    files.map(file => {
      if (file.type === 'git') return;
      if (file.fileUri) {
        const id = btoa(file.id);
        window.resolveLocalFileSystemURL(dir + id, entry => {
          fs.readFile(dir + id).then(res => {
            const data = res.data;
            const decoder = new TextDecoder("utf-8");
            const originalText = decoder.decode(data);

            fs.deleteFile(dir + id)
              .catch(err => {
                console.log(err);
              });

            window.resolveLocalFileSystemURL(file.fileUri, () => {
              fs.readFile(file.fileUri).then(res => {
                const data = res.data;
                // const decoder = new TextDecoder("utf-8");
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
    });

    if (!editorManager.activeFile) {
      document.body.focus();
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
    const action = e.target.getAttribute('action');
    if (!action) return;

    $mainMenu.hide();
    if (action in menuHandler) {
      let param;
      switch (action) {
        case 'openFolder':
          param = $sidebar;
          break;
      }
      menuHandler[action](param);
    }
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handleFooter(e) {
    quickToolAction(e, $footer, $_row1, $_row2, _search);
  }

  function footerTouchStart(e) {
    arrowkeys.onTouchStart(e, $footer);
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function footerOnContextMenu(e) {
    e.preventDefault();
    editor.focus();
  }
}

//#region global funtions

function restoreTheme(darken) {
  if (appSettings.value.appTheme === 'default') {
    const hexColor = darken ? '#5c5c99' : '#9999ff';
    document.body.classList.remove('theme-light');
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-default');
    NavigationBar.backgroundColorByHexString(hexColor, false);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  } else if (appSettings.value.appTheme === 'light') {
    const hexColor = darken ? '#999999' : '#ffffff';
    document.body.classList.remove('theme-default');
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    NavigationBar.backgroundColorByHexString(hexColor, !!darken);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleDefault();
  } else {
    const hexColor = darken ? '#1d1d1d' : '#313131';
    document.body.classList.remove('theme-default');
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    NavigationBar.backgroundColorByHexString(hexColor, true);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  }
}

function runPreview() {
  const activeFile = editorManager.activeFile;

  const filename = activeFile.filename;
  const path = activeFile.location;
  const decoder = new TextDecoder('utf-8');

  webserver.start(() => {
    openBrowser();
  }, err => {
    if (err === "Server already running") {
      openBrowser();
    } else {
      console.log(err);
    }
  }, 8080);

  webserver.onRequest(req => {
    let reqPath = req.path;
    const assets = `${cordova.file.applicationDirectory}www`;

    if (reqPath === '/') {
      reqPath = 'index.html';
    }

    if (reqPath === '/_console.js') {
      const url = `${assets}/js/injection.build.js`;
      sendFileContent(url, req.requestId, 'application/javascript');
    } else if (reqPath === '/_esprisma.js') {
      const url = `${assets}/js/esprisma.js`;
      sendFileContent(url, req.requestId, 'application/javascript');
    } else if (reqPath === '/_codeflask.js') {
      const url = `${assets}/js/codeflask.min.js`;
      sendFileContent(url, req.requestId, 'application/javascript');
    } else if (reqPath === '/_console.css') {
      const url = `${assets}/css/console.css`;
      sendFileContent(url, req.requestId, 'text/css');
    } else if (helpers.getExt(reqPath) === 'html') {
      if (reqPath === '/' + filename && (activeFile.isUnsaved || !activeFile.location || activeFile.type === 'git')) {
        sendHTML(activeFile.session.getValue(), req.requestId);
      } else {
        fs.readFile(path + reqPath)
          .then(res => {
            let text = decoder.decode(res.data);
            sendHTML(text, req.requestId);
          });
      }
    } else {
      if (activeFile.type === 'git') {
        const cache = cordova.file.cacheDirectory;
        const uri = cache + activeFile.record.sha + encodeURIComponent(reqPath) + '.' + helpers.getExt(reqPath);

        window.resolveLocalFileSystemURL(uri, () => {
          sendFile(uri.replace('file://', ''), req.requestId);
        }, err => {
          if (err.code === 1) {
            git.getGitFile(activeFile.record, reqPath.slice(1))
              .then(res => {
                const data = helpers.b64toBlob(res, mimeType.lookup(reqPath));
                fs.writeFile(uri, data, true, false)
                  .then(() => {
                    sendFile(uri.replace('file://', ''), req.requestId);
                  })
                  .catch(err => {
                    if (err.code) dialogs.alert(strings.error, helpers.getErrorMessage(err.code));
                    console.log(err);
                  });
              })
              .catch(err => {
                console.log(err);
                error();
              })
          } else {
            error();
          }
        });
      } else {
        if (path) sendFile(path.replace('file://', '') + reqPath, req.requestId);
        else error();
      }
    }

    function error() {
      webserver.sendResponse(req.requestId, {
        status: 404
      });
    }
  });

  /**
   * 
   * @param {string} text 
   * @param {string} id 
   */
  function sendHTML(text, id) {
    const js = `<script src="_console.js"></script><script src="_esprisma.js"></script><script src="_codeflask.js"></script><link rel="stylesheet" href="_console.css">`;
    text = text.replace(/><\/script>/g, 'crossorigin="anonymous"></script>');
    const part = text.split('<head>');
    if (part.length === 2) {
      text = `${part[0]}<head>${js}${part[1]}`;
    } else if (/<html>/i.test(text)) {
      text = text.replace('<html>', `<head>${js}</head>`)
    } else {
      text = `<head>${js}</head>` + text;
    }

    sendText(text, id);
  }

  function sendFile(path, id) {
    webserver.sendResponse(id, {
      status: 200,
      path,
      headers: {}
    });
  }

  function sendFileContent(url, id, mimeType) {
    fs.readFile(url)
      .then(res => {
        const text = decoder.decode(res.data);
        sendText(text, id, mimeType);
      })
  }

  function sendText(text, id, mimeType) {
    webserver.sendResponse(id, {
      status: 200,
      body: text,
      headers: {
        'Content-Type': mimeType || 'text/html'
      }
    });
  }

  function openBrowser() {
    const theme = appSettings.value.appTheme;
    const themeColor = theme === 'default' ? '#9999ff' : theme === 'dark' ? '#313131' : '#ffffff';
    const color = theme === 'light' ? '#9999ff' : '#ffffff';
    const options = `location=yes,hideurlbar=yes,cleardata=yes,clearsessioncache=yes,hardwareback=yes,clearcache=yes,toolbarcolor=${themeColor},navigationbuttoncolor=${color},closebuttoncolor=${color},clearsessioncache=yes,zoom=no`;
    window.open('http://localhost:8080/' + filename, '_system', options);
  }
}
//#endregion