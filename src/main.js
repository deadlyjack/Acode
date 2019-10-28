//import styles
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

//import modules
import "core-js/stable";
import {
  tag
} from "html-element-js";
import gen from './components/gen';
import tile from "./components/tile";
import sidenav from './components/sidenav';
import contextMenu from './components/contextMenu';
import EditorManager from './modules/editorManager';
import fs from './modules/androidFileSystem';
import FileBrowser from "./page/fileBrowser";
import ActionStack from "./modules/actionStack";
import helpers from "./modules/helpers";
import Settings from "./settings";
import list from "./components/list";
import dialogs from "./components/dialogs";
import constants from "./constants";
import settingsPage from './page/settings/mainSettings';
import help from "./page/help";
import demoPage from "./page/demoPages";
import clipboardAction from "./modules/clipboard";
import ajax from "./modules/ajax";

//@ts-check

window.onload = Main;

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
      ['clipboard', 'keyboard_control'], //done
      ['tab', 'keyboard_tab'], //done
      ['shift', 'custom shift'], //done
      'undo', //done
      'redo', //done
      'search', //done
      ['save', 'save'], //done
      ['row2', 'more_vert'] //done
    ],
    row2: [
      ['left', 'keyboard_arrow_left'], //done
      ['right', 'keyboard_arrow_right'], //done
      ['up', 'keyboard_arrow_up'], //done
      ['down', 'keyboard_arrow_down'], //done
      ['moveup', 'custom moveline-up'], //done
      ['movedown', 'custom moveline-down'], //done
      ['copyup', 'custom copyline-up'], //done
      ['copydown', 'custom copyline-down'] //done
    ]
  };
  const row1 = gen.iconButton(footerOptions.row1);
  const row2 = gen.iconButton(footerOptions.row2);
  const mainMenu = contextMenu({
    top: '6px',
    right: '6px',
    toggle: menuToggler,
    transformOrigin: 'top right'
  });
  const main = tag('main');
  const menuOptions = gen.listTileGen([
    ['newFile', strings['new file']],
    ['save', strings.save],
    ['saveAs', strings['save as']],
    ['openFile', strings['open file']],
    ['openFolder', strings['open folder']],
    '{{saperate}}',
    ['goto', strings.goto],
    '{{saperate}}',
    // 'Remote FTP',
    // 'Google Drive',
    // 'DropBox',
    // '{{saperate}}',
    ['settings', strings.settings],
    ['help', strings.help]
  ]);
  const sidebar = sidenav(main, toggler);
  const editorManager = EditorManager(sidebar, header, main);
  const thisObj = {
    editorManager,
    header
  };
  const runBtn = tag('button', {
    className: 'icon float bottom right file-control play',
    onclick: runPreview.bind(runBtn, editorManager)
  });
  //#endregion

  //#region initialization
  window.restoreTheme();
  main.setAttribute("data-empty-msg", strings['no editor message']);
  menuOptions.save.classList.add('disabled');
  menuOptions.saveAs.classList.add('disabled');
  menuOptions.goto.classList.add('disabled');
  //#endregion

  //#region rendering
  mainMenu.append(...Object.values(menuOptions));
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

  //#region main menu

  menuOptions.newFile.addEventListener('click', function () {
    mainMenu.hide();
    dialogs.prompt(strings['enter file name'], '', "filename", {
        match: constants.FILE_NAME_REGEX,
        required: true
      })
      .then(filename => {
        if (filename) {
          filename = helpers.removeLineBreaks(filename);
          editorManager.addNewFile(filename);
        }
      })
      .catch(err => {
        console.log(err);
      });
  });

  menuOptions.openFile.addEventListener('click', function () {
    mainMenu.hide();
    FileBrowser('file', function (uri) {
        const ext = helpers.getExt(uri);

        if (appSettings.value.filesNotAllowed.includes((ext || '').toLowerCase())) {
          alert(strings.notice.toUpperCase(), `'${ext}' ${strings['file is not supported']}`);
          return false;
        }
        return true;
      })
      .then(res => {
        const uri = res.url;
        const timeout = setTimeout(() => {
          document.body.classList.add('loading');
        }, 50);
        createEditorFromURI.bind(thisObj)(uri, undefined, {
          readOnly: res.readOnly,
          timeout
        }).then(() => {
          if (timeout) {
            clearTimeout(timeout);
          }
          document.body.classList.remove('loading');
        });
      })
      .catch(err => {
        if (err.code) {
          alert(strings.error.toUpperCase(), `${strings['unable to open file']}. ${helpers.getErrorMessage(err.code)}`);
        } else if (err.code !== 0) {
          alert(strings.error.toUpperCase(), strings['unable to open file']);
        }
      });
  });

  menuOptions.save.addEventListener('click', function (e) {
    if (e.isTrusted) {
      mainMenu.hide();
    }
    /**
     * @type {acodeEditor}
     */
    const activeEditor = editorManager.activeEditor;

    if (!activeEditor) return;
    if (appSettings.value.beautify) {
      beautify(activeEditor.editor.session);
    }
    const data = activeEditor.editor.getValue();
    let id = activeEditor.id;
    let url = activeEditor.dir;
    if (activeEditor.fileUri) {
      fs.writeFile(activeEditor.fileUri, data)
        .then(() => {
          activeEditor.isUnsaved = false;
          window.plugins.toast.showShortBottom('file saved');
          activeEditor.assocTile.classList.remove('notice');
          editorManager.onupdate.call({
            activeEditor: editorManager.activeEditor
          });
        })
        .catch(fileNotSaveErr);
    } else if (activeEditor.contentUri) {
      alert(strings.warning.toUpperCase(), strings["read only file"]);
    } else {
      FileBrowser('folder', strings['save here'])
        .then(res => {
          url = res.url;
          id = url + encodeURI(activeEditor.filename);
          return fs.writeFile(id, data, true);
        })
        .then(() => {
          for (let key in addedFolder) {
            if (new RegExp(key).test(url)) {
              addedFolder[key].reload();
            }
          }
          editorManager.update(id, null, url);
        })
        .catch(err => {
          if (err.code === 12) {
            dialogs.confirm(strings['file already exists']).then(() => {
              fs.writeFile(id, data, true, false).then(() => editorManager.update(id, null, url));
            });
          } else {
            fileNotSaveErr(err);
          }
        });
    }
  });

  menuOptions.saveAs.addEventListener('click', function () {
    mainMenu.hide();
    /**
     * @type {acodeEditor}
     */
    const activeEditor = editorManager.activeEditor;
    const data = activeEditor.editor.getValue();
    let id = activeEditor.id;
    let dir = activeEditor.dir;
    let filename = activeEditor.filename;
    FileBrowser('folder', strings['save here'])
      .then(res => {
        if (dir !== res.url) {
          for (let key in addedFolder) {
            if (new RegExp(key).test(res.url)) {
              addedFolder[key].reload();
            }
          }
        }
        dir = res.url;
        return dialogs.prompt(strings['enter file name'], activeEditor.filename, 'text', {
          match: constants.FILE_NAME_REGEX,
          required: true
        });
      })
      .then(name => {
        filename = name;
        filename = helpers.removeLineBreaks(filename);
        id = dir + encodeURI(filename);
        return fs.writeFile(id, data, true);
      })
      .then(() => {
        window.plugins.toast.showShortBottom(strings['file saved']);
        editorManager.update(id, filename, dir, activeEditor);
      })
      .catch(err => {
        if (err.code === 12) {
          dialogs.confirm(strings['file already exists']).then(() => {
            fs.writeFile(id, data, true, false).then(() => editorManager.update(id, filename, dir, activeEditor));
          });
        } else {
          fileNotSaveErr(err);
        }
      });
  });

  menuOptions.openFolder.addEventListener('click', function () {
    mainMenu.hide();
    FileBrowser('folder')
      .then(res => {
        if (res.url in addedFolder) {
          window.plugins.toast.showShortBottom(strings['folder already added']);
          return;
        }
        return addFolder(res, sidebar, thisObj);
      })
      .then(() => {
        window.plugins.toast.showShortBottom(strings['folder added']);
      })
      .catch(err => {
        if (err.code) {
          alert(strings.error.toUpperCase(), `${strings['unable to open folder']}. ${helpers.getErrorMessage(err.code)}`);
        } else if (err.code !== 0) {
          alert(strings.error.toUpperCase(), strings['unable to open folder']);
        }
      });
  });

  menuOptions.goto.addEventListener('click', function () {
    mainMenu.hide();
    dialogs.prompt('Enter line number', '', 'numeric').then(lineNumber => {
        const activeEditor = editorManager.activeEditor;
        activeEditor.editor.focus();
        if (activeEditor) {
          activeEditor.editor.gotoLine(lineNumber, 0, true);
        }
      })
      .catch(err => {
        console.log(err);
      });
  });

  menuOptions.settings.addEventListener('click', function () {
    mainMenu.hide();
    settingsPage();
  });
  menuOptions.help.addEventListener('click', function () {
    mainMenu.hide();
    help(footerOptions);
  });

  function fileNotSaveErr(err) {
    if (err.code) {
      alert(strings.error.toUpperCase(), `${strings['unable to save file']}. ${helpers.getErrorMessage(err.code)}.`);
    } else if (err.code !== 0) {
      alert(strings.error.toUpperCase(), strings['unable to save file']);
    }
    console.error(err);
  }

  //#endregion

  //#region footer

  row1.tab.onclick = function () {
    const activeEditor = editorManager.activeEditor;
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
    editorManager.activeEditor.editor.focus();
    if (this.isActive) {
      this.classList.remove('active');
      this.isActive = false;
    } else {
      this.classList.add('active');
      this.isActive = true;
    }
  };

  row1.undo.onclick = function () {
    const activeEditor = editorManager.activeEditor;
    activeEditor.editor.focus();
    if (activeEditor) {
      activeEditor.editor.undo();
    }
  };

  row1.redo.onclick = function () {
    const activeEditor = editorManager.activeEditor;
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
     * @type {acodeEditor}
     */
    const activeEditor = editorManager.activeEditor;
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
    const activeEditor = editorManager.activeEditor;
    if (activeEditor.fileUri || activeEditor.contentUri)
      activeEditor.editor.focus();
    menuOptions.save.click();
  };

  row1.clipboard.onclick = function () {
    const selectedText = editorManager.activeEditor.editor.getCopyText();
    const options = ['paste', 'select all', ['openCommandPallete', 'pallete']];

    if (selectedText)
      options.unshift('copy', 'cut');

    dialogs.select(null, options)
      .then(res => clipboardAction(res, editorManager.activeEditor));
  }

  row1.row2.onclick = function () {

    if (app.classList.contains('threestories')) {
      row1.search.click();
    }

    const activeEditor = editorManager.activeEditor;

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
    const activeEditor = editorManager.activeEditor;
    activeEditor.editor.focus();
    if (activeEditor) {
      activeEditor.editor.moveLinesUp();
    }
  };

  row2.movedown.onclick = function () {
    const activeEditor = editorManager.activeEditor;
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
      editorManager.activeEditor.editor.focus();
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
      editorManager.activeEditor.editor.focus();
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
      editorManager.activeEditor.editor.focus();
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
      editorManager.activeEditor.editor.focus();
    }
  };

  row2.left.ontouchend = row2.right.ontouchend = row2.up.ontouchend = row2.down.ontouchend = rmInterval;
  row2.left.onclick = row2.right.onclick = row2.up.onclick = row2.down.onclick = function () {
    editorManager.activeEditor.editor.focus();
  };

  row2.copyup.onclick = function () {
    const editor = editorManager.activeEditor.editor;
    editor.focus();
    editor.copyLinesUp();
  };

  row2.copydown.onclick = function () {
    const editor = editorManager.activeEditor.editor;
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
        }, 1000);
        //#region event listeners 
        if (cordova.platformId === 'android') {
          window.plugins.intent.setNewIntentHandler(HandleIntent.bind(thisObj));
          window.plugins.intent.getCordovaIntent(HandleIntent.bind(thisObj), function (e) {
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
     * @type {acodeEditor}
     */
    const activeEditor = this.activeEditor;

    if (!mainFooter.parentElement && activeEditor) {
      app.classList.add('bottom-bar');
      app.append(mainFooter);
    }

    if (!activeEditor) {
      menuOptions.save.classList.add('disabled');
      menuOptions.saveAs.classList.add('disabled');
      menuOptions.goto.classList.add('disabled');
      app.classList.remove('bottom-bar');
      app.removeChild(mainFooter);
      runBtn.remove();
    } else if (activeEditor) {
      menuOptions.saveAs.classList.remove('disabled');
      menuOptions.goto.classList.remove('disabled');

      if (!activeEditor.readOnly) {
        menuOptions.save.classList.remove('disabled');
        row1.save.classList.remove('disabled');
      } else {
        menuOptions.save.classList.add('disabled');
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
    const activeEditor = editorManager.activeEditor;
    const unsaved = [];

    for (let editor of editorManager.editors) {
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
        const extDir = cordova.file.externalDataDirectory;
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
    const activeEditor = editorManager.activeEditor;
    if (activeEditor) activeEditor.editor.blur();
  };

  function loadFiles() {
    return new Promise((resolve) => {
      if (localStorage.files !== '[]') {
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

            createEditorFromURI.bind(thisObj)(file.fileUri, false, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });
          } else if (file.contentUri) {

            if (file.contentUri === lastfile) {
              xtra.render = true;
            }

            createEditorFromURI.bind(thisObj)({
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
      if (localStorage.folders !== '[]') {
        const folders = JSON.parse(localStorage.getItem('folders'));
        folders.map((folder, i) => {
          addFolder(folder, sidebar, thisObj, i).then(index => {
            if (index === folders.length - 1) resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }

  function checkFiles() {
    for (let key in addedFolder) {
      addedFolder[key].reload();
    }
    const editors = editorManager.editors;
    const dir = cordova.file.externalDataDirectory;
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
                          activeEditor: editorManager.activeEditor
                        });
                      });
                  }
                }
              }).catch(err => {
                console.error(err);
              });
            }, err => {
              if (err.code === 1) {
                editorManager.removeEditor(editor);
              }
            });
          });
        }, err => {});
      }
    });

    if (!editorManager.activeEditor) {
      document.body.focus();
    }

    /**
     * 
     * @param {acodeEditor} editor 
     * @param {string} text 
     */
    function update(editor, text) {
      const cursorPos = editor.editor.getCursorPosition();
      editor.editor.setValue(text);
      editor.isUnsaved = false;
      editor.editor.moveCursorToPosition(cursorPos);
      editor.editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
      editor.assocTile.classList.remove('notice');
    }
  }
  //#endregion
}

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
  window.appSettings = new Settings(lang);
  window.actionStack = ActionStack();
  window.editorCount = 0;
  window.alert = dialogs.alert;
  window.addedFolder = {};
  window.fileClipBoard = null;
  window.isLoading = true;
  window.restoreTheme = restoreTheme;
  window.getCloseMessage = () => {};
  window.beforeClose = null;

  if (!('files' in localStorage)) {
    localStorage.setItem('files', '[]');
  }
  if (!('folders' in localStorage)) {
    localStorage.setItem('folders', '[]');
  }

  document.addEventListener("deviceready", () => {
    const url = `${cordova.file.applicationDirectory}www/lang/${appSettings.value.lang}.json`;
    fs.readFile(url)
      .then(res => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(res.data);
        window.strings = JSON.parse(text);
        runApp();
      });
  });
}

function runApp() {
  const version = localStorage.getItem('version');
  if (version !== AppVersion.version) {
    localStorage.clear();
    localStorage.setItem('version', AppVersion.version);
  }

  document.body = tag(document.body);
  window.app = document.body;
  window.onerror = function (message, file, lineno, colno) {
    const errFile = cordova.file.externalApplicationStorageDirectory;
    window.resolveLocalFileSystemURL(errFile, dirEntry => {
      dirEntry.getFile('error.log', {
        create: true
      }, fileEntry => {
        fileEntry.createWriter(fw => {
          fw.seek(fw.length);
          fw.write(`------------------------\n\t${file}:${lineno}:${colno}\n\t${message}\n`);
        });
      });
    });
  };
  document.addEventListener('backbutton', actionStack.pop);
  window.beautify = ace.require("ace/ext/beautify").beautify;
  if (!localStorage.initFlag) {
    document.body.classList.remove('loading', 'splash');
    NavigationBar.backgroundColorByHexString("#9999ff");
    StatusBar.backgroundColorByHexString("#9999ff");
    demoPage().then(() => {
      new App();
    });
  } else {
    new App();
  }
}

//#region global funtions

/** 
 *  
 * @param {object} intent  
 * @param {string} intent.type  
 * @param {ClipItems[]} intent.clipItems 
 * @param {string} intent.data  
 * @param {string} intent.action  
 * @param {string} [intent.fileUri]  
 * @param {string} [intent.error]  
 * @param {string} [intent.filename]  
 * @param {object} [intent.extras]  
 */
function HandleIntent(intent = {}) {
  const type = intent.action.split('.').slice(-1)[0];
  let timeout = null;

  if (!window.isLoading) {
    timeout = setTimeout(() => {
      document.body.classList.add('loading');
    }, 50);
  }

  if (type === 'VIEW') {
    if (!intent.error && intent.fileUri) {
      createEditorFromURI.bind(this)(intent.fileUri).then(stopLoading);
    } else if (intent.error && intent.filename) {
      const url = helpers.convertToFile(intent.data) || intent.data;
      createEditorFromURI.bind(this)({
        dir: url.dir || url,
        name: intent.filename
      }, true).then(stopLoading);
    } else if (intent.error) {
      if (intent.data) {
        let directory = helpers.convertToFile(intent.data);
        let isContentUri = false;
        let name = intent.filename;

        if (!directory && !name) {
          alert(strings.error.toUpperCase(), strings['unable to open file']);
          return;
        } else if (!directory && name) {
          directory = intent.data;
        } else if (directory.dir) {
          let tmp = directory;
          directory = directory.dir;
          if (!name && tmp.name) {
            name = tmp.name;
          } else {
            alert(strings.error.toUpperCase(), strings['unable to open file']);
            return;
          }
        }
        createEditorFromURI.bind(this)({
          directory,
          name
        }, isContentUri).then(stopLoading);
      } else {
        alert(strings.error.toUpperCase(), strings['unable to open file']);
        console.log(intent.error);
      }
    }
  } else if (type === 'SEND') {
    if (intent.fileUri) {
      createEditorFromURI.bind(this)(intent.fileUri);
    } else if (intent.clipItems) {
      const clipItems = intent.clipItems;
      for (let obj of clipItems) {
        if (obj.uri) {
          const url = obj.uri;
          let uri = helpers.convertToFile(url);
          let isContentUri = false;
          if (!uri) {
            uri = url;
            isContentUri = true;
          }

          createEditorFromURI.bind(this)(uri, isContentUri);
          break;
        }
      }
    }
  } else if (!window.isLoading) {
    stopLoading();
  }

  function stopLoading() {
    if (timeout) {
      clearTimeout(timeout);
    }
    document.body.classList.remove('loading');
  }
  console.log(intent);
}

/**
 * 
 * @param {string|fileOptons} uri 
 * @param {boolean} isContentUri 
 * @param {string} data
 */

function createEditorFromURI(uri, isContentUri, data = {}) {
  return new Promise(resolve => {
    if (typeof uri === 'string') {
      const name = decodeURI(uri.split('/').pop());
      const dir = uri.replace(encodeURI(name), '');

      uri = {
        dir,
        name
      };
    }
    /**
     * @type {Manager}
     */
    const editorManager = this.editorManager;
    const settings = appSettings.value;
    const location = uri.dir;
    const name = uri.name;
    const ext = helpers.getExt(name);
    const id = location + (isContentUri ? '' : encodeURI(name));
    const {
      cursorPos,
      render,
      readOnly,
      index,
      timeout
    } = data;

    if (settings.filesNotAllowed.includes(ext)) {
      return alert(strings.notice, `'${ext}' ${strings['file is not supported']}`);
    }

    if (editorManager.getEditor(id)) {
      editorManager.switchEditor(id);
      resolve(id);
      return;
    }

    if (data.text) {
      editorManager.addNewFile(name, {
        contentUri: location,
        fileUri: id,
        location,
        render,
        text: data.text,
        cursorPos: data.cursorPos,
        isUnsaved: true,
        readOnly: data.readOnly
      });
      resolve(index === undefined ? id : index);
      return;
    }

    fs.readFile(id)
      .then(res => {
        /**
         * @type {ArrayBuffer}
         */
        const data = res.data;
        const size = res.file && res.file.size || data.byteLength;

        if (size * 0.000001 > settings.maxFileSize) {
          return alert(strings.error.toUpperCase(), `${strings['file too large']} ${settings.maxFileSize}MB`);
        }

        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(data);

        if (/[\x00-\x08\x0E-\x1F]/.test(text)) {
          if (timeout) clearTimeout(timeout);
          document.body.classList.remove('loading');
          return alert(strings.error.toUpperCase(), strings['file not supported']);
        }

        editorManager.addNewFile(name, {
          fileUri: id,
          contentUri: location,
          isContentUri,
          location,
          cursorPos,
          text,
          isUnsaved: false,
          render,
          readOnly
        });

        resolve(index === undefined ? id : index);
      })
      .catch(err => {
        if (err.code) {
          alert(strings.error.toUpperCase(), `${strings['unable to open file']} (${helpers.getErrorMessage(err.code)}).`);
        }
        console.error(err);

        resolve(index === undefined ? id : index);
      });
  });
}

function addFolder(folder, sidebar, thisObj, index) {
  return new Promise(resolve => {
    /**
     * @type {Manager}
     */
    const editorManager = thisObj.editorManager;
    const name = folder.name === 'File Browser' ? 'Home' : folder.name;
    const rootUrl = folder.url;
    const closeFolder = tag('span', {
      className: 'icon cancel'
    });
    let rootNode = list.collaspable(name, false, 'folder', {
      tail: closeFolder
    });
    rootNode.titleEl.type = 'dir';
    rootNode.titleEl.name = name;
    rootNode.titleEl.id = rootUrl;
    closeFolder.addEventListener('click', function () {
      if (rootNode.parentElement) {
        sidebar.removeChild(rootNode);
        rootNode = null;
      }
      const tmpFolders = {};
      for (let url in addedFolder) {
        if (url !== rootUrl) tmpFolders[url] = addedFolder[url];
      }
      addedFolder = tmpFolders;
      this.removeEvents();
    });
    rootNode.titleEl.addEventListener('contextmenu', function (e) {
      if (e.cancelable) {
        e.preventDefault();
      }
      navigator.vibrate(50);
      dialogs.select(name, [
        ['new folder', strings['new folder'], 'file-control folder-outline-add'],
        ['new file', strings['new file'], 'file-control document-add'],
        ['paste', strings.paste, 'file-control clipboard'],
        ['reload', strings.reload, 'loop']
      ]).then(res => {
        if (res === 'reload') {
          reload();
          return;
        }
        onSelect(res, this, thisObj);
      });
    });

    plotFolder(rootUrl, rootNode);
    sidebar.append(rootNode);

    addedFolder[rootUrl] = {
      reload,
      name
    };

    function plotFolder(url, rootNode) {
      rootNode.clearList();
      fs.listDir(url).then(dirList => {
        dirList = helpers.sortDir(dirList, appSettings.value.fileBrowser);
        dirList.map(item => {
          if (item.isDirectory) {
            createFolderTile(rootNode, item);
          } else {
            createFileTile(rootNode, item);
          }
        });
        resolve(index);
      }).catch(() => {
        rootNode.remove();
        delete addedFolder[rootUrl];
        resolve(index);
      });
      return rootNode;
    }

    function reload() {
      plotFolder(rootUrl, rootNode);
    }

    function createFileTile(rootNode, item) {
      const listItem = tile({
        lead: tag('span', {
          className: helpers.getIconForFile(item.name),
          style: {
            paddingRight: '5px'
          }
        }),
        text: item.name
      });
      listItem.type = 'file';
      listItem.id = item.nativeURL;
      listItem.name = item.name;
      listItem.addEventListener('click', function () {
        createEditorFromURI.bind(thisObj)(this.id).then(() => {
          sidebar.hide();
        });
      });
      listItem.addEventListener('contextmenu', function (e) {
        if (e.cancelable) {
          e.preventDefault();
        }
        navigator.vibrate(50);
        dialogs.select(this.name, [
          ['copy', strings.copy, 'file-control clipboard'],
          ['cut', strings.cut, 'file-control edit-cut'],
          ['delete', strings.delete, 'delete'],
          ['rename', strings.rename, 'edit']
        ]).then(res => {
          onSelect(res, this);
        });
      });
      rootNode.addListTile(listItem);
    }

    function createFolderTile(rootNode, item) {
      const name = item.name;
      const node = list.collaspable(name, true, 'folder');

      node.titleEl.type = 'dir';
      node.titleEl.id = item.nativeURL;
      node.titleEl.name = name;

      node.titleEl.addEventListener('contextmenu', function (e) {
        if (e.cancelable) {
          e.preventDefault();
        }
        navigator.vibrate(50);
        dialogs.select(this.name, [
          ['copy', strings.copy, 'file-control clipboard'],
          ['cut', strings.cut, 'file-control edit-cut'],
          ['new folder', strings['new folder'], 'file-control folder-outline-add'],
          ['new file', strings['new file'], 'file-control document-add'],
          ['paste', strings.paste, 'file-control clipboard'],
          ['rename', strings.rename, 'edit'],
          ['delete', strings['delete'], 'delete']
        ]).then(res => {
          onSelect(res, this);
        });
      });
      rootNode.addListTile(plotFolder(item.nativeURL, node));
    }

    function onSelect(selectedOption, obj) {
      let timeout;
      switch (selectedOption) {

        case 'delete':
          dialogs.confirm(strings.warning.toUpperCase(), strings['delete {name}'].replace('{name}', obj.name))
            .then(() => {
              fs.deleteFile(obj.id).then(() => {
                window.plugins.toast.showShortBottom(strings["file deleted"]);
                if (obj.type === 'dir') {
                  deleteFolder(obj.parentElement.list);
                } else {

                  const editor = editorManager.getEditor(obj.id);
                  if (editor) {
                    editorManager.removeEditor(editor, true);
                  }

                  obj.remove();
                }
              }).catch(err => {
                if (err.code) {
                  alert(strings.error, `${strings['unable to delete file']}. ${helpers.getErrorMessage(err.code)}`);
                }
                console.error(err);
              });
            });
          break;

        case 'rename':
          dialogs.prompt(obj.type === 'file' ? strings['enter file name'] : strings['enter folder name'], obj.name, 'filename', {
            required: true,
            match: constants.FILE_NAME_REGEX
          }).then(newname => {
            fs.renameFile(obj.id, newname)
              .then((parent) => {
                success();
                let newid = parent.nativeURL + encodeURI(newname);
                if (obj.type === 'file') {

                  const editor = editorManager.getEditor(obj.id);
                  if (editor) {
                    editorManager.update(newid, newname, null, editor);
                  }

                  obj.lead(tag('i', {
                    className: helpers.getIconForFile(newname)
                  }));
                  obj.text(newname);

                } else if (obj.type === 'dir') {
                  newid += '/';
                  const editors = editorManager.editors;
                  editors.map(ed => {
                    if (ed.location === obj.id) {
                      editorManager.updateLocation(ed, newid);
                    }
                  });
                  obj.parentElement.text(newname);
                }

                obj.name = newname;
                obj.id = newid;
              })
              .catch(error);
          });
          break;

        case 'copy':
          updateCut();
          fileClipBoard = {};
          fileClipBoard.type = obj.type;
          fileClipBoard.method = 'copy';
          fileClipBoard.uri = obj.id;
          break;

        case 'cut':
          updateCut();
          fileClipBoard = {};
          fileClipBoard.type = obj.type;
          fileClipBoard.method = 'cut';
          fileClipBoard.uri = obj.id;
          obj.classList.add('cut');
          break;

        case 'paste':
          if (!fileClipBoard) return;
          const el = document.getElementById(fileClipBoard.uri);
          window.resolveLocalFileSystemURL(fileClipBoard.uri, fs => {
            window.resolveLocalFileSystemURL(obj.id, parent => {
              obj = obj.parentElement;

              window.resolveLocalFileSystemURL(parent.nativeURL + fs.name, res => {
                dialogs.prompt(strings['enter file name'], fs.name, 'filename', {
                    required: true,
                    match: constants.FILE_NAME_REGEX
                  })
                  .then(res => {
                    if (fileClipBoard.method === 'copy') {
                      paste(el, fs, parent, 'copyTo', res);
                    } else {
                      paste(el, fs, parent, 'moveTo', res);
                    }
                  });
              }, err => {
                if (err.code === 1) {
                  if (fileClipBoard.method === 'copy') {
                    paste(el, fs, parent);
                  } else {
                    paste(el, fs, parent, 'moveTo');
                  }
                } else {
                  alert(strings.error.toUpperCase(), strings.failed);
                  document.body.classList.remove('loading');
                }

              });

            }, error);
          }, error);
          break;

        case 'new file':
        case 'new folder':
          const ask = selectedOption === 'new file' ? strings['enter file name'] : strings['enter folder name'];
          dialogs.prompt(ask, selectedOption, 'filename', {
            match: constants.FILE_NAME_REGEX,
            required: true
          }).then(filename => {
            window.resolveLocalFileSystemURL(obj.id, fs => {
              if (selectedOption === 'new folder') {
                fs.getDirectory(filename, {
                  create: true,
                  exclusive: true
                }, res => {
                  success();
                  reload();
                }, error);
              } else {
                fs.getFile(filename, {
                  create: true,
                  exclusive: true
                }, res => {
                  success();
                  reload();
                }, error);
              }
            });
          });
          break;

        default:
          break;
      }

      function paste(el, fs, parent, action = "copyTo", newname = null) {
        timeout = setTimeout(() => {
          document.body.classList.add('loading');
        }, 100);
        fs[action](parent, newname, res => {
          if (res.isFile) {
            if (action === "moveTo") {
              let editor = editorManager.getEditor(fileClipBoard.uri);
              if (editor) editorManager.removeEditor(editor, true);
              el.remove();
            }
            success();
            createFileTile(obj, res);
          } else {
            success();
            if (action === "moveTo") deleteFolder(el.parentElement.querySelector('ul'));
            reload();
          }
          clearTimeout(timeout);
          document.body.classList.remove('loading');
        }, error);
      }

      function error(err) {
        alert(strings.error.toUpperCase(), `${strings.failed}, ${helpers.getErrorMessage(err.code)}`);
        if (timeout) clearTimeout(timeout);
        document.body.classList.remove('loading');
        console.log(err);
      }

      function success() {
        window.plugins.toast.showShortBottom(strings.success);
      }

      function deleteFolder(obj) {
        const children = obj.children;
        const length = obj.childElementCount;
        const listItems = [];
        for (let i = 0; i < length; ++i) {
          listItems.push(children[i]);
        }

        listItems.map(item => {
          const editor = editorManager.getEditor(item.id || '');
          if (editor) {
            editorManager.removeEditor(editor);
          }
        });

        obj.parentElement.remove();
      }

      function updateCut() {
        if (fileClipBoard) {
          let el = document.getElementById(fileClipBoard.uri);
          if (el) el.classList.remove('cut');
        }
      }
    }

  });
}

function restoreTheme(darken) {
  if (appSettings.value.appTheme === 'default') {
    const hexColor = darken ? '#5c5c99' : '#9999ff';
    document.body.classList.add('theme-default');
    NavigationBar.backgroundColorByHexString(hexColor, false);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  } else if (appSettings.value.appTheme === 'light') {
    const hexColor = darken ? '#999999' : '#ffffff';
    document.body.classList.add('theme-light');
    NavigationBar.backgroundColorByHexString(hexColor, !!darken);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleDefault();
  } else {
    const hexColor = darken ? '#1d1d1d' : '#313131';
    document.body.classList.add('theme-dark');
    NavigationBar.backgroundColorByHexString(hexColor, true);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  }
}

function runPreview(editorManager) {
  const activeEditor = editorManager.activeEditor;
  if (activeEditor.fileUri) {
    let uri = activeEditor.fileUri;
    window.resolveLocalFileSystemURL(uri, entry => {
      if (entry.isDirectory) return;
      entry.getParent(parent => {
        fs.readFile(uri)
          .then(res => {
            const decoder = new TextDecoder('utf-8');
            const url = `${cordova.file.applicationDirectory}www/js/injection.min.js`;
            let text = decoder.decode(res.data);
            fs.readFile(url)
              .then(res => {
                let js = decoder.decode(res.data);
                js = `<script>${js}</script>`;
                text = text.split('<head>');
                text = `${text[0]}<head>${js}${text[1]}`;
                const name = parent.nativeURL + '.run_' + entry.name;
                fs.writeFile(name, text, true, false)
                  .then(() => {
                    run(name);
                  });
              });
          });
      })
    });
  } else {
    alert(strings.warning.toUpperCase(), strings['save file to run']);
  }

  function run(uri) {
    const mode = appSettings.value.previewMode;
    if (mode === strings['not set']) {
      dialogs.select('Select mode', ['desktop', 'mobile'])
        .then(mode => {
          run(mode);
        });
    } else {
      run(mode);
    }

    function run(mode) {
      const ref = cordova.InAppBrowser.open(uri, '_blank', 'location=yes, clearcache=yes');
      ref.addEventListener('loadstart', function () {
        ref.executeScript({
          code: `window.__mode = '${mode}';`
        });
      });

      ref.addEventListener('exit', function () {
        fs.deleteFile(uri);
      });
    }
  }
}
//#endregion