import saveFile from "./saveFile";
import select from './handlers/selectword';
import runPreview from "./runPreview";

import settingsMain from '../pages/settings/mainSettings';
import dialogs from '../components/dialogs';
import createEditorFromURI from "../lib/createEditorFromURI";
import openFolder from "../lib/addFolder";
import helpers from "../lib/utils/helpers";
import constants from "./constants";
import GithubLogin from "../pages/login/login";
import gitHub from "../pages/github/gitHub";
import help from '../pages/help';
import recents from '../lib/recents';
import fsOperation from '../lib/fileSystem/fsOperation';
import Modes from '../pages/modes/modes';
import clipboardAction from '../lib/clipboard';
import quickTools from './handlers/quickTools';
import FTPAccounts from "../pages/ftp-accounts/ftp-accounts";
import FileBrowser from "../pages/fileBrowser/fileBrowser";
import Url from "./utils/Url";

const commands = {
  "console": function () {
    runPreview(true, 'in app');
  },
  "copy": function () {
    clipboardAction('copy');
  },
  "color": function () {
    clipboardAction("color");
  },
  "cut": function () {
    clipboardAction('cut');
  },
  "encoding": function () {
    dialogs.select(strings.encoding, constants.encodings, {
        default: editorManager.activeFile.encoding
      })
      .then(encoding => {
        const file = editorManager.activeFile;
        file.encoding = encoding;
        const text = file.session.getValue();
        const decodedText = new TextEncoder().encode(text);
        const newText = new TextDecoder(encoding).decode(decodedText);
        file.session.setValue(newText);
        file.isUnsaved = false;
        editorManager.onupdate();
      });
  },
  "find": function () {
    quickTools.actions('search');
  },
  "format": function () {
    const file = editorManager.activeFile;
    const editor = editorManager.editor;

    let pos = editor.getCursorPosition();
    const tmp = editorManager.onupdate;
    editorManager.onupdate = () => {};
    beautify(file.session);
    editorManager.onupdate = tmp;
    editor.selection.moveCursorToPosition(pos);
  },
  "ftp": function () {
    FTPAccounts();
  },
  "github": function () {
    if ((!localStorage.username || !localStorage.password) && !localStorage.token)
      return GithubLogin();
    gitHub();
  },
  "goto": function () {
    dialogs.prompt(strings['enter line number'], '', 'number').then(lineNumber => {
        const editor = editorManager.editor;
        editor.focus();
        if (editor) {
          editor.gotoLine(lineNumber, 0, true);
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  "new-file": function () {
    dialogs.prompt(strings['enter file name'], constants.DEFAULT_FILE_NAME, "filename", {
        match: constants.FILE_NAME_REGEX,
        required: true
      })
      .then(filename => {
        if (filename) {
          filename = helpers.removeLineBreaks(filename);
          editorManager.addNewFile(filename, {
            isUnsaved: false
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  "next-file": function () {
    const len = editorManager.files.length;
    let fileIndex = editorManager.files.indexOf(editorManager.activeFile);

    if (fileIndex === len - 1) fileIndex = 0;
    else ++fileIndex;

    editorManager.switchFile(editorManager.files[fileIndex].id);
  },
  "open": function (page) {
    if (page === 'settings') settingsMain();
    if (page === 'help') help();
    editorManager.editor.blur();
  },
  "open-file": function () {
    editorManager.editor.blur();
    FileBrowser('file', function (uri) {
        const ext = helpers.extname(uri);

        if (appSettings.defaultSettings.filesNotAllowed.includes((ext || '').toLowerCase())) {
          alert(strings.notice.toUpperCase(), `'${ext}' ${strings['file is not supported']}`);
          return false;
        }
        return true;
      })
      .then(res => {
        const {
          url,
          isContentUri,
          filename
        } = res;

        const createOption = {
          fileUri: isContentUri ? null : url,
          contentUri: isContentUri ? url : null,
          name: filename
        };
        createEditorFromURI(createOption, undefined);
      })
      .catch(err => {
        if (err.code) {
          alert(strings.error.toUpperCase(), `${strings['unable to open file']}. ${helpers.getErrorMessage(err.code)}`);
        } else if (err.code !== 0) {
          alert(strings.error.toUpperCase(), strings['unable to open file']);
        }
        console.error(err);
      });
  },
  "open-folder": function () {
    editorManager.editor.blur();
    FileBrowser('folder')
      .then(res => {
        const url = res.url;
        const protocol = Url.getProtocol(url);

        if (protocol === "ftp:") {
          return openFolder(res.url, {
            name: res.name,
            reloadOnResume: false,
            saveState: false
          });
        } else {
          return openFolder(res.url, {
            name: res.name
          });
        }

      })
      .then(() => {
        window.plugins.toast.showShortBottom(strings['folder added']);
        editorManager.onupdate();
      })
      .catch(err => {
        if (err.code) {
          alert(strings.error.toUpperCase(), `${strings['unable to open folder']}. ${helpers.getErrorMessage(err.code)}`);
        } else if (err.code !== 0) {
          alert(strings.error.toUpperCase(), strings['unable to open folder']);
        }
      });
  },
  "paste": function () {
    clipboardAction('paste');
  },
  "prev-file": function () {
    const len = editorManager.files.length;
    let fileIndex = editorManager.files.indexOf(editorManager.activeFile);

    if (fileIndex === 0) fileIndex = len - 1;
    else --fileIndex;

    editorManager.switchFile(editorManager.files[fileIndex].id);
  },
  "read-only": function () {
    const file = editorManager.activeFile;
    file.editable = !file.editable;
    editorManager.onupdate();
  },
  "recent": function () {
    const all = [];
    let files = recents.files;
    let dirs = recents.folders;
    const MAX = 20;
    const shortName = name => name.length > MAX ? '...' + name.substr(-MAX - 3) : name;
    for (let dir of dirs) {
      const url = new URL(dir.url);
      let title = dir.url;
      if (dir.name) {
        title = dir.name;
      } else {
        if (url.hostname && url.username) title = `${url.username}@${url.hostname}`;
        if (url.hostname) title = url.protocol + url.hostname;
      }
      all.push([{
        type: 'dir',
        val: dir
      }, shortName(title), 'icon folder']);

    }
    for (let file of files)
      all.push([{
        type: 'file',
        val: file
      }, shortName(decodeURI(file)), helpers.getIconForFile(file)]);

    all.push(['clear', strings.clear, 'icon clearclose']);

    dialogs.select(strings['open recent'], all, {
        textTransform: false
      })
      .then(res => {
        if (res.type === 'file') {
          createEditorFromURI(res.val);
        } else if (res.type === 'dir') {
          openFolder(res.val.url, res.val.opts);
        } else if (res === 'clear') {
          delete localStorage.recentFiles;
          delete localStorage.recentFolders;
          recents.files = [];
          recents.folders = [];
        }
      });
  },
  "rename": function (file) {
    file = file || editorManager.activeFile;
    dialogs.prompt(strings.rename, file.filename, 'filename', {
        match: constants.FILE_NAME_REGEX
      })
      .then(newname => {
        if (!newname || newname === file.filename) return;
        newname = helpers.removeLineBreaks(newname);

        if (file.fileUri) {
          fsOperation(file.fileUri)
            .then(fs => {
              return fs.renameTo(newname);
            })
            .then(() => {
              file.filename = newname;
              helpers.updateFolders(file.location);
              window.plugins.toast.showShortBottom(strings['file renamed']);
            })
            .catch(err => {
              helpers.error(err);
              console.error(err);
            });
        } else if (file.contentUri) {
          alert(strings['unable to rename']);
        } else {
          file.filename = newname;
          if (file.type === 'regular') window.plugins.toast.showShortBottom(strings['file renamed']);
        }
      });
  },
  "replace": function () {
    this.find();
  },
  "run": function () {
    runPreview();
  },
  "save": function (toast) {
    saveFile(editorManager.activeFile, false, toast);
  },
  "save-as": function (toast) {
    saveFile(editorManager.activeFile, true, toast);
  },
  "select-all": function () {
    clipboardAction('select all');
  },
  "select-word": select,
  "select-line": () => select('line'),
  "syntax": function () {
    editorManager.editor.blur();
    Modes()
      .then(mode => {
        editorManager.activeFile.session.setMode(mode);
      });
  },
  "toggle-quick-tools": function () {
    quickTools.actions("toggle-quick-tools");
  },
  "toggle-fullscreen": () => {
    app.classList.toggle("fullscreen-mode");
    editorManager.editor.resize(true);
  }
};

export default commands;