import saveFile from './saveFile';
import select from './handlers/selectword';
import run from './run';
import settingsMain from '../pages/settings/mainSettings';
import dialogs from '../components/dialogs';
import openFile from './openFile';
import openFolder from './openFolder';
import helpers from '../lib/utils/helpers';
import constants from './constants';
import GithubLogin from '../pages/login/login';
import gitHub from '../pages/github/gitHub';
import help from '../pages/help';
import recents from '../lib/recents';
import fsOperation from '../lib/fileSystem/fsOperation';
import Modes from '../pages/modes/modes';
import clipboardAction from '../lib/clipboard';
import quickTools from './handlers/quickTools';
import FileBrowser from '../pages/fileBrowser/fileBrowser';
import path from './utils/Path';
import showFileInfo from './showFileInfo';

const commands = {
  'close-all-tabs'() {
    for (let file of editorManager.files) {
      editorManager.removeFile(file);
    }
  },
  'close-current-tab'() {
    editorManager.removeFile(editorManager.activeFile);
  },
  console() {
    run(true, 'in app');
  },
  copy() {
    clipboardAction('copy');
  },
  cut() {
    clipboardAction('cut');
  },
  'check-files'() {
    (async () => {
      const files = editorManager.files;
      const { editor } = editorManager;

      for (let file of files) {
        if (file.isUnsaved) continue;

        if (file.uri) {
          const fs = fsOperation(file.uri);

          if (!(await fs.exists()) && !file.readOnly) {
            file.isUnsaved = true;
            file.uri = null;
            dialogs.alert(
              strings.info.toUpperCase(),
              strings['file has been deleted'].replace('{file}', file.filename),
            );
            editorManager.onupdate('file-changed');
            continue;
          }

          const text = await fs.readFile('utf-8');
          const loadedText = file.session.getValue();

          if (text !== loadedText) {
            try {
              await dialogs.confirm(
                strings.warning.toUpperCase(),
                file.filename + strings['file changed'],
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
    })();
  },
  'disable-fullscreen'() {
    app.classList.remove('fullscreen-mode');
    this['resize-editor']();
  },
  'enable-fullscreen'() {
    app.classList.add('fullscreen-mode');
    this['resize-editor']();
    editorManager.controls.vScrollbar.resize();
  },
  encoding() {
    dialogs
      .select(strings.encoding, constants.encodings, {
        default: editorManager.activeFile.encoding,
      })
      .then((encoding) => {
        const file = editorManager.activeFile;
        file.encoding = encoding;
        const text = file.session.getValue();
        const decodedText = new TextEncoder().encode(text);
        const newText = new TextDecoder(encoding).decode(decodedText);
        file.session.setValue(newText);
        file.isUnsaved = false;
        editorManager.onupdate('encoding');
      });
  },
  exit() {
    navigator.app.exitApp();
  },
  files() {
    FileBrowser('both', strings['file browser'])
      .then(FileBrowser.open)
      .catch(FileBrowser.openError);
  },
  find() {
    quickTools.actions('search');
  },
  format() {
    const file = editorManager.activeFile;
    const editor = editorManager.editor;

    let pos = editor.getCursorPosition();
    const tmp = editorManager.onupdate;
    editorManager.onupdate = () => {};
    beautify(file.session);
    editorManager.onupdate = tmp;
    editor.selection.moveCursorToPosition(pos);
  },
  'file-info'(url) {
    showFileInfo(url);
  },
  github() {
    if (
      (!localStorage.username || !localStorage.password) &&
      !localStorage.token
    )
      return GithubLogin();
    gitHub();
  },
  goto() {
    dialogs
      .prompt(strings['enter line number'], '', 'number', {
        placeholder: 'line.column',
      })
      .then((lineNumber) => {
        const editor = editorManager.editor;
        editor.focus();
        const [line, col] = lineNumber.split('.');
        editor.gotoLine(line, col, true);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  'insert-color'() {
    clipboardAction('color');
  },
  'new-file'() {
    dialogs
      .prompt(
        strings['enter file name'],
        constants.DEFAULT_FILE_NAME,
        'filename',
        {
          match: constants.FILE_NAME_REGEX,
          required: true,
        },
      )
      .then((filename) => {
        if (filename) {
          filename = helpers.removeLineBreaks(filename);
          editorManager.addNewFile(filename, {
            isUnsaved: false,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },
  'next-file'() {
    const len = editorManager.files.length;
    let fileIndex = editorManager.files.indexOf(editorManager.activeFile);

    if (fileIndex === len - 1) fileIndex = 0;
    else ++fileIndex;

    editorManager.switchFile(editorManager.files[fileIndex].id);
  },
  open(page) {
    if (page === 'settings') settingsMain();
    if (page === 'help') help();
    editorManager.editor.blur();
  },
  'open-file'() {
    editorManager.editor.blur();
    FileBrowser('file')
      .then(FileBrowser.openFile)
      .catch(FileBrowser.openFileError);
  },
  'open-folder'() {
    editorManager.editor.blur();
    FileBrowser('folder')
      .then(FileBrowser.openFolder)
      .catch(FileBrowser.openFolderError);
  },
  paste() {
    clipboardAction('paste');
  },
  'prev-file'() {
    const len = editorManager.files.length;
    let fileIndex = editorManager.files.indexOf(editorManager.activeFile);

    if (fileIndex === 0) fileIndex = len - 1;
    else --fileIndex;

    editorManager.switchFile(editorManager.files[fileIndex].id);
  },
  'read-only'() {
    const file = editorManager.activeFile;
    file.editable = !file.editable;
    editorManager.onupdate('read-only');
  },
  recent() {
    recents.select().then((res) => {
      const { type } = res;
      if (helpers.isFile(type)) {
        openFile(res.val, {
          render: true,
        }).catch((err) => {
          helpers.error(err);
        });
      } else if (helpers.isDir(type)) {
        openFolder(res.val.url, res.val.opts);
      } else if (res === 'clear') {
        recents.clear();
      }
    });
  },
  async rename(file) {
    file = file || editorManager.activeFile;

    if (file.mode === 'single') {
      dialogs.alert(strings.info.toUpperCase(), strings['unable to rename']);
      return;
    }

    let newname = await dialogs.prompt(
      strings.rename,
      file.filename,
      'filename',
      {
        match: constants.FILE_NAME_REGEX,
      },
    );

    if (!newname || newname === file.filename) return;
    newname = helpers.removeLineBreaks(newname);
    const { uri } = file;
    if (uri) {
      const fs = fsOperation(uri);
      try {
        const newUri = await fs.renameTo(newname);
        file.uri = newUri;
        file.filename = newname;

        openFolder.updateItem(uri, newUri, newname);
        toast(strings['file renamed']);
      } catch (err) {
        helpers.error(err);
      }
    } else {
      file.filename = newname;
      // if (file.type === 'regular') toast(strings['file renamed']);
    }
  },
  replace() {
    this.find();
  },
  'resize-editor'() {
    editorManager.editor.resize(true);
    editorManager.controls.update();
  },
  run() {
    run();
  },
  'run-file'() {
    run.runFile();
  },
  save(toast) {
    saveFile(editorManager.activeFile, false, toast);
  },
  'save-state'() {
    const filesToSave = [];
    const folders = [];
    const { activeFile } = editorManager;
    const { editor } = editorManager;
    const { files } = editorManager;
    for (let file of files) {
      if (file.id === constants.DEFAULT_FILE_SESSION) {
        continue;
      }

      const edit = {
        id: file.id,
        filename: file.filename,
        type: file.type,
        uri: file.uri,
        isUnsaved: file.isUnsaved,
        readOnly: file.readOnly,
        mode: file.mode,
        deltedFile: file.deltedFile,
        cursorPos: editor.getCursorPosition(),
      };

      if (edit.type === 'git') edit.sha = file.record.sha;
      else if (edit.type === 'gist') {
        edit.recordid = file.record.id;
        edit.isNew = file.record.isNew;
      }

      filesToSave.push(edit);
    }

    addedFolder.forEach((folder) => {
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

    localStorage.files = JSON.stringify(filesToSave);
    localStorage.folders = JSON.stringify(folders);
  },
  'save-as'(toast) {
    saveFile(editorManager.activeFile, true, toast);
  },
  'select-all'() {
    clipboardAction('select all');
  },
  'select-word': select,
  'select-line': select.bind({}, 'line'),
  syntax() {
    editorManager.editor.blur();
    Modes().then((mode) => {
      const activefile = editorManager.activeFile;
      const ext = path.extname(activefile.filename);

      const defaultmode = modelist.getModeForPath(activefile.filename).mode;
      if (ext !== '.txt' && defaultmode === 'ace/mode/text') {
        let modeAssociated;
        try {
          modeAssociated = JSON.parse(localStorage.modeassoc || '{}');
        } catch (error) {
          modeAssociated = {};
        }

        modeAssociated[ext] = mode;
        localStorage.modeassoc = JSON.stringify(modeAssociated);
      }

      activefile.setMode(mode);
    });
  },
  'toggle-quick-tools'() {
    quickTools.actions('toggle-quick-tools');
    editorManager.controls.vScrollbar.resize();
  },
  'toggle-fullscreen'() {
    app.classList.toggle('fullscreen-mode');
    this['resize-editor']();
  },
  'toggle-sidebar'() {
    editorManager.sidebar.toggle();
  },
  'toggle-menu'() {
    Acode.$menuToggler.click();
  },
  'toggle-editmenu'() {
    Acode.$editMenuToggler.click();
  },
};

export default commands;
