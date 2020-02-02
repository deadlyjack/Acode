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
          editorManager.addNewFile(filename);
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
        const uri = res.url;
        const timeout = setTimeout(() => {
          document.body.classList.add('loading');
        }, 500);
        createEditorFromURI(uri, undefined, {
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