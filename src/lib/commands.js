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
import checkFiles from './checkFiles';
import saveState from './saveState';
import { commandPallete } from '../components/commandPallete';
import tag from 'html-tag-js';

export default {
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
    if (!appSettings.value.checkFiles) return;
    checkFiles();
  },
  'command-pallete'() {
    commandPallete();
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
        editorManager.emit('update', 'encoding');
      });
  },
  async eol() {
    const eol = await dialogs.select(
      strings['new line mode'],
      ['unix', 'windows'],
      {
        default: editorManager.activeFile.eol,
      },
    );
    editorManager.activeFile.eol = eol;
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
  async format() {
    const { editor } = editorManager;
    const pos = editor.getCursorPosition();

    await acode.format();
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
  },
  'load-ad': () => {
    if (IS_FREE_VERSION && admob) {
      admob
        .start()
        .then(async () => {
          const ad = new admob.BannerAd({
            adUnitId: 'ca-app-pub-5911839694379275/9157899592', // Production
            // adUnitId: 'ca-app-pub-3940256099942544/6300978111', // Test
            position: 'bottom',
          });
          window.ad = ad;
        });
    }
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
    tag.get('[action=run]')?.click();
  },
  'run-file'() {
    tag.get('[action=run]')?.contextmenu();
  },
  save(toast) {
    saveFile(editorManager.activeFile, false, toast);
  },
  'save-state'() {
    saveState();
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

      let modeAssociated;
      try {
        modeAssociated = JSON.parse(localStorage.modeassoc || '{}');
      } catch (error) {
        modeAssociated = {};
      }

      modeAssociated[ext] = mode;
      localStorage.modeassoc = JSON.stringify(modeAssociated);

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
    tag.get('[action=toggle-menu]')?.click();
  },
  'toggle-editmenu'() {
    tag.get('[action=toggle-edit-menu')?.click();
  },
};
