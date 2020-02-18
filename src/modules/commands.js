import tag from 'html-tag-js';
import saveFile from "./saveFile";
import settingsMain from '../pages/settings/mainSettings';
import dialogs from '../components/dialogs';
import createEditorFromURI from "./createEditorFromURI";
import addFolder from "./addFolder";
import helpers from "./helpers";
import constants from "../constants";
import FileBrowser from "../pages/fileBrowser/fileBrowser";
import GithubLogin from "../pages/login/login";
import gitHub from "../pages/github/gitHub";
import runPreview from "./runPreview";
import help from '../pages/help';
import recents from './recents';

const commands = {
  "console": function () {
    runPreview(true, 'in app');
  },
  "find": function () {
    const $find = tag.get('#find-tool');
    if ($find) $find.click();
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
    dialogs.prompt(strings['enter file name'], strings['new file'], "filename", {
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
  },
  "open-file": function () {
    FileBrowser('file', function (uri) {
        const ext = helpers.getExt(uri);

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
    FileBrowser('folder')
      .then(res => {
        return addFolder(res, editorManager.sidebar);
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
  "prev-file": function () {
    const len = editorManager.files.length;
    let fileIndex = editorManager.files.indexOf(editorManager.activeFile);

    if (fileIndex === 0) fileIndex = len - 1;
    else --fileIndex;

    editorManager.switchFile(editorManager.files[fileIndex].id);
  },
  "recent": function () {
    const all = [];
    let files = recents.files;
    let dirs = recents.folders;
    const MAX = 20;
    const shortName = name => name.length > MAX ? '...' + name.substr(-MAX - 3) : name;
    for (let dir of dirs)
      all.push([{
        type: 'dir',
        val: dir
      }, shortName(decodeURI(dir)), 'icon folder']);
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
          addFolder(res.val, editorManager.sidebar);
        } else if (res === 'clear') {
          delete localStorage.recentFiles;
          delete localStorage.recentFolders;
          recents.files = [];
          recents.folders = [];
        }
      });
  },
  "replace": function () {
    this.find();
  },
  "save": function () {
    saveFile(editorManager.activeFile);
  },
  "save-as": function () {
    saveFile(editorManager.activeFile, true);
  },
};

export default commands;