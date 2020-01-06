import settingsMain from "../pages/settings/mainSettings";
import createEditorFromURI from "./createEditorFromURI";
import addFolder from "./addFolder";
import helpers from "./helpers";
import constants from "../constants";
import saveFile from "./saveFile";
import help from "../pages/help";
import dialogs from "../components/dialogs";
import FileBrowser from "../pages/fileBrowser/fileBrowser";
import GithubLogin from "../pages/login/login";
import gitHub from "../pages/github/gitHub";

export default {
    newFile: function () {
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
    openFile: function () {
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
    save: function (e) {
        /**
         * @type {File}
         */
        const file = editorManager.activeFile;
        if (!file) return;
        saveFile(file);
    },
    saveAs: function () {
        /**
         * @type {File}
         */
        const editor = editorManager.activeFile;
        if (!editor) return;
        saveFile(editor, true);
    },
    openFolder: function (sidebar) {
        FileBrowser('folder')
            .then(res => {
                return addFolder(res, sidebar);
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
    },
    goto: function () {
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
    settings: function () {
        settingsMain();
    },
    help: function () {
        help();
    },
    console: function () {
        const options = `location=no,clearcache=yes,clearsessioncache=yes,zoom=no`
        const ref = cordova.InAppBrowser.open(`${cordova.file.applicationDirectory}www/console.html`, '_blank', options);

        ref.addEventListener('loadstart', function () {
            ref.executeScript({
                code: `
                if(!window.consoleLoaded){
                  window.addEventListener('error', function(err){
                    console.error(err);
                  })
                }
              `
            });
        });
    },
    github: function () {
        if ((!localStorage.username || !localStorage.password) && !localStorage.token)
            return GithubLogin();
        gitHub();
    }
};