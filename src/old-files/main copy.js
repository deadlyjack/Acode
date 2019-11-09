import "./styles/index.scss";
import "./styles/page.scss";
import './styles/list.scss';
import './styles/sidenav.scss';
import './styles/tile.scss';
import './styles/contextMenu.scss';
import './styles/dialogs.scss';
import './styles/settings.scss';
import './styles/aboutUs.scss';
import './styles/themes.scss';
import './styles/help.scss';
import './styles/demo-page.scss';
import './styles/overwriteAceStyle.scss';

import "core-js/stable";
import tag from 'html-tag-js';
import gen from '../components/gen';
import tile from "../components/tile";
import sidenav from '../components/sidenav';
import contextMenu from '../components/contextMenu';
import EditorManager from '../modules/editorManager';
import fs from '../modules/androidFileSystem';
import ActionStack from "../modules/actionStack";
import helpers from "../modules/helpers";
import Settings from "../settings";
import dialogs from "../components/dialogs";
import constants from "../constants";
import demoPage from "../page/demoPages";
import clipboardAction from "../modules/clipboard";
import HandleIntent from "../modules/handleIntent";
import createEditorFromURI from "../modules/createEditorFromURI";
import addFolder from "../modules/addFolder";
import menuHandler from "../modules/menuHandler";
import saveFile from "../modules/saveFile";

//@ts-check

window.onload = Main;

function Main() {
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
    window.appSettings = new Settings(lang);
    if (appSettings.loaded) {
      ondeviceready();
    } else {
      appSettings.onload = ondeviceready;
    }
  });

  function ondeviceready() {
    const url = `${cordova.file.applicationDirectory}www/lang/${appSettings.value.lang}.json`;
    fs.readFile(url)
      .then(res => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(res.data);
        window.strings = JSON.parse(text);
        runApp();
      });
  }
}

function runApp() {
  const version = localStorage.getItem('version');
  if (version !== AppVersion.version) {
    localStorage.clear();
    localStorage.setItem('version', AppVersion.version);
  }

  document.body = tag(document.body);
  window.app = document.body;
  document.addEventListener('backbutton', actionStack.pop);
  window.beautify = ace.require("ace/ext/beautify").beautify;
  if (!appSettings.value.initFlag) {
    document.body.classList.remove('loading', 'splash');
    NavigationBar.backgroundColorByHexString("#9999ff");
    StatusBar.backgroundColorByHexString("#9999ff");
    demoPage().then(() => {
      appSettings.value.initFlag = true;
      appSettings.update(false);
      new App();
    });
  } else {
    new App();
  }
}

function App() {
  //#region declaration
  const toggler = tag('span', {
    className: 'icon menu'
  });
  const menuToggler = tag("span", {
    className: 'icon more_vert'
  });
  const header = tile({
    type: 'header',
    text: 'Acode',
    lead: toggler,
    tail: menuToggler
  });
  const mainFooter = tag('footer');
  const footerRow1 = tag('div', {
    className: 'button-container'
  });
  const footerRow2 = tag('div', {
    className: 'button-container'
  });
  const footerOptions = {
    row1: [
      ['clipboard', 'keyboard_control'],
      ['tab', 'keyboard_tab'],
      ['shift', 'custom shift'],
      'undo',
      'redo',
      'search',
      ['save', 'save'],
      ['row2', 'more_vert']
    ],
    row2: [
      ['left', 'keyboard_arrow_left'],
      ['right', 'keyboard_arrow_right'],
      ['up', 'keyboard_arrow_up'],
      ['down', 'keyboard_arrow_down'],
      ['moveup', 'custom moveline-up'],
      ['movedown', 'custom moveline-down'],
      ['copyup', 'custom copyline-up'],
      ['copydown', 'custom copyline-down']
    ]
  };
  const menu = `<li action="newFile">${strings['new file']}</li>
    <li action="save" class="disabled">${strings.save}</li>
    <li action="saveAs" class="disabled">${strings['save as']}</li>
    <li action="openFile">${strings['open file']}</li>
    <li action="openFolder">${strings['open folder']}</li>
    <hr>
    <li action="goto" class="disabled">${strings['goto']}</li>
    <hr>
    <li action="settings">${strings.settings}</li>
    <li action="help">${strings.help}</li>`;
  const row1 = gen.iconButton(footerOptions.row1);
  const row2 = gen.iconButton(footerOptions.row2);
  const $mainMenu = contextMenu({
    top: '6px',
    right: '6px',
    toggle: menuToggler,
    transformOrigin: 'top right'
  }, menu);
  const main = tag('main');
  const sidebar = sidenav(main, toggler);
  const runBtn = tag('button', {
    className: 'icon float bottom right file-control play',
    onclick: runPreview.bind(runBtn, editorManager)
  });
  const fileOptions = {
    save: $mainMenu.querySelector('[action=save]'),
    saveAs: $mainMenu.querySelector('[action=saveAs]'),
    goto: $mainMenu.querySelector('[action=goto]')
  }

  window.editorManager = EditorManager(sidebar, header, main);
  //#endregion

  //#region initialization
  window.restoreTheme();
  main.setAttribute("data-empty-msg", strings['no editor message']);

  //#endregion

  //#region rendering
  footerRow1.append(...Object.values(row1));
  footerRow2.append(...Object.values(row2));
  header.classList.add('light');
  mainFooter.appendChild(footerRow1);
  app.append(header, main);
  //#endregion

  //#region request management

  const permissions = cordova.plugins.permissions;
  const requiredPermissions = [
    permissions.WRITE_EXTERNAL_STORAGE,
    permissions.WRITE_MEDIA_STORAGE
  ];

  function permissionCheckError() {
    // console.error('Permission denied');
  }

  requiredPermissions.map((permission, i) => {
    permissions.checkPermission(permission, (status) => successCheckPermission(status, i));
  });

  function successCheckPermission(status, i) {
    if (!status.hasPermission) {

      permissions.requestPermission(
        requiredPermissions[i],
        status => {
          if (!status.hasPermission) permissionCheckError();
        },
        permissionCheckError
      );

    }
  }
  //#endregion

  $mainMenu.addEventListener('click', handleMenu);

  //#region footer

  row1.tab.onclick = function () {
    const activeEditor = editorManager.activeFile;
    activeEditor.editor.focus();
    const keyevent = new KeyboardEvent("keydown", {
      key: 9,
      keyCode: 9,
      shiftKey: row1.shift.isActive
    });

    document.querySelector('.ace_text-input').dispatchEvent(keyevent);
    if (activeEditor.updateControls) {
      activeEditor.updateControls();
    }
  };

  row1.shift.onclick = function () {
    editorManager.activeFile.editor.focus();
    if (this.isActive) {
      this.classList.remove('active');
      this.isActive = false;
    } else {
      this.classList.add('active');
      this.isActive = true;
    }
  };

  row1.undo.onclick = function () {
    const activeEditor = editorManager.activeFile;
    activeEditor.editor.focus();
    if (activeEditor) {
      activeEditor.editor.undo();
    }
  };

  row1.redo.onclick = function () {
    const activeEditor = editorManager.activeFile;
    activeEditor.editor.focus();
    if (activeEditor) {
      activeEditor.editor.redo();
    }
  };

  row1.search.onclick = function () {
    if (footerRow2.parentElement) {
      mainFooter.removeChild(footerRow2);
      app.classList.remove('twostories');
    }
    /**
     * @type {File}
     */
    const activeEditor = editorManager.activeFile;
    let lastActive = activeEditor.editor;
    let init = false;
    const findInput = tag('input', {
      type: 'text',
      placeholder: strings.search,
      oninput: function () {
        lastActive = this;
        init = false;
      }
    });
    const replaceInput = tag('input', {
      type: 'text',
      placeholder: strings.replace,
      oninput: function () {
        lastActive = this;
      }
    });
    const nextBtn = tag('button', {
      className: 'icon arrow_forward',
      onclick: function () {
        lastActive.focus();
        const options = JSON.parse(JSON.stringify(appSettings.value.search));
        if (initFind())
          activeEditor.editor.findNext(options, false);
      }
    });
    const prevBtn = tag('button', {
      className: 'icon arrow_back',
      onclick: function () {
        lastActive.focus();
        const options = JSON.parse(JSON.stringify(appSettings.value.search));
        if (initFind())
          activeEditor.editor.findPrevious(options, false);
      }
    });
    const replaceBtn = tag('button', {
      className: 'icon custom replace',
      onclick: function () {
        lastActive.focus();
        if (initFind(true))
          activeEditor.editor.replace(replaceInput.value);
      }
    });
    const replaceAllBtn = tag('button', {
      className: 'icon custom replace_all',
      onclick: function () {
        lastActive.focus();
        if (initFind(true))
          activeEditor.editor.replaceAll(replaceInput.value);
      }
    });
    const find = tag('footer', {
      className: 'button-container',
      children: [
        findInput,
        prevBtn,
        nextBtn
      ]
    });
    const replace = tag('footer', {
      className: 'button-container',
      children: [
        replaceInput,
        replaceBtn,
        replaceAllBtn
      ]
    });
    app.classList.add('threestories');
    mainFooter.append(find, replace);
    findInput.focus();

    function initFind(replace) {
      if (!init) {
        const options = JSON.parse(JSON.stringify(appSettings.value.search));
        if (!findInput.value) return false;
        activeEditor.editor.find(findInput.value, options, false);
        init = true;
        return !!replace;
      }
      return true;
    }
    const fun = this.onclick;
    this.onclick = function () {
      activeEditor.editor.focus();
      app.classList.remove('threestories');
      mainFooter.removeChild(find);
      mainFooter.removeChild(replace);
      this.onclick = fun;
    };
  };

  row1.save.onclick = function () {
    const activeEditor = editorManager.activeFile;
    if (!activeEditor) return;
    if (activeEditor.fileUri || activeEditor.contentUri)
      activeEditor.editor.focus();

    saveFile(activeEditor);
  };

  row1.clipboard.onclick = function () {
    const activeEditor = editorManager.activeFile;
    if (!activeEditor) return;
    activeEditor.ace.execCommand('openCommandPallete');
  }

  row1.row2.onclick = function () {

    if (app.classList.contains('threestories')) {
      row1.search.click();
    }

    const activeEditor = editorManager.activeFile;

    if (footerRow2.parentElement) {
      mainFooter.removeChild(footerRow2);
      app.classList.remove('twostories');
    } else {
      mainFooter.append(footerRow2);
      app.classList.add('twostories');
    }

    activeEditor.editor.focus();
  };

  row2.moveup.onclick = function () {
    const activeEditor = editorManager.activeFile;
    activeEditor.editor.focus();
    if (activeEditor) {
      activeEditor.editor.moveLinesUp();
    }
  };

  row2.movedown.onclick = function () {
    const activeEditor = editorManager.activeFile;
    activeEditor.editor.focus();
    if (activeEditor) {
      activeEditor.editor.moveLinesDown();
    }
  };

  row2.left.ontouchstart = function () {
    moveCursorLeft();
    this.interval = setInterval(moveCursorLeft, 100);

    function moveCursorLeft() {
      const keyevent = new KeyboardEvent("keydown", {
        key: 37,
        keyCode: 37,
        shiftKey: row1.shift.isActive
      });

      document.querySelector('.ace_text-input').dispatchEvent(keyevent);
      editorManager.activeFile.editor.focus();
    }
  };

  row2.right.ontouchstart = function () {
    moveCursorRight();
    this.interval = setInterval(moveCursorRight, 100);

    function moveCursorRight() {
      const keyevent = new KeyboardEvent("keydown", {
        key: 39,
        keyCode: 39,
        shiftKey: row1.shift.isActive
      });

      document.querySelector('.ace_text-input').dispatchEvent(keyevent);
      editorManager.activeFile.editor.focus();
    }
  };

  row2.up.ontouchstart = function () {
    moveCursorUp();

    this.interval = setInterval(moveCursorUp, 100);

    function moveCursorUp() {
      const keyevent = new KeyboardEvent("keydown", {
        key: 38,
        keyCode: 38,
        shiftKey: row1.shift.isActive
      });

      document.querySelector('.ace_text-input').dispatchEvent(keyevent);
      editorManager.activeFile.editor.focus();
    }
  };

  row2.down.ontouchstart = function () {
    moveCursorDown();
    this.interval = setInterval(moveCursorDown, 100);

    function moveCursorDown() {
      const keyevent = new KeyboardEvent("keydown", {
        key: 40,
        keyCode: 40,
        shiftKey: row1.shift.isActive
      });

      document.querySelector('.ace_text-input').dispatchEvent(keyevent);
      editorManager.activeFile.editor.focus();
    }
  };

  row2.left.ontouchend = row2.right.ontouchend = row2.up.ontouchend = row2.down.ontouchend = rmInterval;
  row2.left.onclick = row2.right.onclick = row2.up.onclick = row2.down.onclick = function () {
    editorManager.activeFile.editor.focus();
  };

  row2.copyup.onclick = function () {
    const editor = editorManager.activeFile.editor;
    editor.focus();
    editor.copyLinesUp();
  };

  row2.copydown.onclick = function () {
    const editor = editorManager.activeFile.editor;
    editor.focus();
    editor.copyLinesDown();
  };

  function rmInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  //#endregion

  //#region loading
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
          document.addEventListener('menubutton', sidebar.toggle);
          navigator.app.overrideButton("menubutton", true);
        }

        document.addEventListener('pause', window.beforeClose);
        document.addEventListener('resume', checkFiles);
        checkFiles();

        //#endregion
      });
  }, 100);

  editorManager.onupdate = function () {
    /**
     * @type {File}
     */
    const activeEditor = this.activeFile;

    if (!mainFooter.parentElement && activeEditor) {
      app.classList.add('bottom-bar');
      app.append(mainFooter);
    }

    if (!activeEditor) {
      fileOptions.save.classList.add('disabled');
      fileOptions.saveAs.classList.add('disabled');
      fileOptions.goto.classList.add('disabled');
      app.classList.remove('bottom-bar');
      mainFooter.remove();
      runBtn.remove();
    } else if (activeEditor) {
      fileOptions.saveAs.classList.remove('disabled');
      fileOptions.goto.classList.remove('disabled');

      if (!activeEditor.readOnly) {
        fileOptions.save.classList.remove('disabled');
        row1.save.classList.remove('disabled');
      } else {
        fileOptions.save.classList.add('disabled');
        row1.save.classList.add('disabled');
      }

      if (activeEditor.isUnsaved) {
        activeEditor.assocTile.classList.add('notice');
        row1.save.classList.add('notice');
      } else {
        activeEditor.assocTile.classList.remove('notice');
        row1.save.classList.remove('notice');
      }

      if (['html', 'htm', 'xhtml'].includes(helpers.getExt(activeEditor.filename))) {
        app.appendChild(runBtn);
      } else {
        runBtn.remove();
      }
    }
  };

  window.beforeClose = function () {
    const lsEditor = [];
    const allFolders = Object.keys(addedFolder);
    const folders = [];
    const activeEditor = editorManager.activeFile;
    const unsaved = [];

    for (let editor of editorManager.files) {
      const edit = {};
      edit.name = editor.filename;
      if (editor.fileUri) {
        edit.fileUri = editor.fileUri;
        edit.readOnly = editor.readOnly ? 'true' : '';
        unsaved.push({
          id: btoa(editor.id),
          fileUri: editor.fileUri
        });
      } else if (editor.contentUri) {
        edit.contentUri = editor.contentUri;
        edit.readOnly = true;
      }
      if (editor.isUnsaved) {
        edit.data = editor.editor.getValue();
      }
      edit.cursorPos = editor.editor.getCursorPosition();
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

    if (activeEditor) {
      localStorage.setItem('lastfile', activeEditor.fileUri || activeEditor.contentUri || activeEditor.filename);
    }

    localStorage.setItem('files', JSON.stringify(lsEditor));
    localStorage.setItem('folders', JSON.stringify(folders));
  };

  window.getCloseMessage = function () {
    const numEditor = editorManager.hasUnsavedEditor();
    if (numEditor) {
      return strings["unsaved files close app"];
    }
  };

  sidebar.onshow = function () {
    const activeEditor = editorManager.activeFile;
    if (activeEditor) activeEditor.editor.blur();
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

          if (file.fileUri) {

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
              dir: encodeURI(file.contentUri),
            }, true, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });

          } else {
            const render = file.name === lastfile;
            const activeEditor = editorManager.addNewFile(file.name, {
              render
            });
            activeEditor.editor.setValue(file.data || '', -1);
            activeEditor.editor.getSession().setUndoManager(new ace.UndoManager());
            if (file.cursorPos) {
              activeEditor.editor.moveCursorToPosition(file.cursorPos);
            }

            if (i === files.length - 1) resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  function loadFolders() {
    return new Promise(resolve => {
      if ('folders' in localStorage && localStorage.folders !== '[]') {
        const folders = JSON.parse(localStorage.getItem('folders'));
        folders.map((folder, i) => {
          addFolder(folder, sidebar, i).then(index => {
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
    const editors = editorManager.files;
    const dir = cordova.file.externalCacheDirectory;
    editors.map(editor => {
      if (editor.fileUri) {
        const id = btoa(editor.id);
        window.resolveLocalFileSystemURL(dir + id, file => {
          fs.readFile(dir + id).then(res => {
            const data = res.data;
            const decoder = new TextDecoder("utf-8");
            const originalText = decoder.decode(data);

            fs.deleteFile(dir + id)
              .catch(err => {
                console.log(err);
              });

            window.resolveLocalFileSystemURL(editor.fileUri, () => {
              fs.readFile(editor.fileUri).then(res => {
                const data = res.data;
                // const decoder = new TextDecoder("utf-8");
                const text = decoder.decode(data);

                if (text !== originalText) {
                  if (!editor.isUnsaved) {
                    update(editor, text);
                  } else {
                    dialogs.confirm(strings.warning.toUpperCase(), editor.filename + strings['file changed'])
                      .then(() => {
                        update(editor, text);
                        editorManager.onupdate.call({
                          activeEditor: editorManager.activeFile
                        });
                      });
                  }
                }
              }).catch(err => {
                console.error(err);
              });
            }, err => {
              if (err.code === 1) {
                editorManager.removeFile(editor);
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
     * @param {File} editor 
     * @param {string} text 
     */
    function update(editor, text) {
      const cursorPos = editor.editor.getCursorPosition();
      editor.editor.setValue(text);
      editor.isUnsaved = false;
      editor.editor.gotoLine(cursorPos.row, cursorPos.column);
      editor.editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
      editor.assocTile.classList.remove('notice');
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
          param = sidebar;
          break;
        case 'help':
          param = footerOptions;
          break;
      }
      menuHandler[action](param);
    }
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
  const activeEditor = editorManager.activeFile;
  if (activeEditor.fileUri) {
    let uri = activeEditor.fileUri;
    window.resolveLocalFileSystemURL(uri, entry => {
      if (entry.isDirectory) return;
      entry.getParent(parent => {
        fs.readFile(uri)
          .then(res => {
            const decoder = new TextDecoder('utf-8');
            const url = `${cordova.file.applicationDirectory}www/js/injection.build.js`;
            let text = decoder.decode(res.data);
            fs.readFile(url)
              .then(res => {
                let js = decoder.decode(res.data);
                let code = js;
                js = `<script>${js}</script>`;
                text = text.split('<head>');
                text = `${text[0]}<head>${js}${text[1]}`;
                const name = parent.nativeURL + '.run_' + entry.name;
                fs.writeFile(name, text, true, false)
                  .then(() => {
                    run(name, code);
                  });
              });
          });
      })
    });
  } else {
    alert(strings.warning.toUpperCase(), strings['save file to run']);
  }

  function run(uri, code) {
    const mode = appSettings.value.previewMode;
    if (mode === 'none') {
      dialogs.select('Select mode', ['desktop', 'mobile'])
        .then(mode => {
          _run(mode);
        });
    } else {
      _run(mode);
    }

    function _run(mode) {
      const theme = appSettings.value.appTheme;
      const useDesktop = mode === 'desktop' ? 'yes' : 'no';
      const themeColor = theme === 'default' ? '#9999ff' : theme === 'dark' ? '#313131' : '#ffffff';
      const color = theme === 'light' ? '#9999ff' : '#ffffff';
      const options = `location=yes,hideurlbar=yes,cleardata=yes,clearsessioncache=yes,hardwareback=yes,clearcache=yes,useWideViewPort=${useDesktop},toolbarcolor=${themeColor},toolbartranslucent=yes,navigationbuttoncolor=${color},closebuttoncolor=${color}`;
      const ref = cordova.InAppBrowser.open(uri, '_blank', options);
      ref.addEventListener('loadstart', function () {
        ref.insertCSS({
          file: `${cordova.file.applicationDirectory}www/css/console.css`
        });
        ref.executeScript({
          code
        });
        ref.executeScript({
          file: `${cordova.file.applicationDirectory}www/js/codeflask.min.js`
        });
        ref.executeScript({
          code: `
            if(!window.consoleLoaded){
              window.addEventListener('error', function(err){
                console.log(err);
              })
            }
            window.__mode = '${mode}';
            window.__log = function(res){(function(res){console.log(res)})(res)};
          `
        });
      });

      ref.addEventListener('exit', function () {
        fs.deleteFile(uri);
      });
    }
  }
}
//#endregion