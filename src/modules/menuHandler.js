import settingsMain from "../page/settings/mainSettings";
import createEditorFromURI from "./createEditorFromURI";
import addFolder from "./addFolder";
import helpers from "./helpers";
import constants from "../constants";
import saveFile from "./saveFile";
import help from "../page/help";
import dialogs from "../components/dialogs";
import FileBrowser from "../page/fileBrowser";

export default {
    newFile: function () {
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
    },
    openFile: function () {
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
        const editor = editorManager.activeFile;
        if (!editor) return;
        saveFile(editor);
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
        dialogs.prompt('Enter line number', '', 'numeric').then(lineNumber => {
                const activeEditor = editorManager.activeFile;
                activeEditor.editor.focus();
                if (activeEditor) {
                    activeEditor.editor.gotoLine(lineNumber, 0, true);
                }
            })
            .catch(err => {
                console.log(err);
            });
    },
    settings: function () {
        settingsMain();
    },
    help: function (footerOptions) {
        help(footerOptions);
    },
    console: function () {
        const theme = appSettings.value.appTheme;
        const themeColor = theme === 'default' ? '#9999ff' : theme === 'dark' ? '#313131' : '#ffffff';
        const color = theme === 'light' ? '#9999ff' : '#ffffff';
        const options = `location=yes,hidenavigationbuttons=yes,hideurlbar=yes,clearcache=yes,toolbarcolor=${themeColor},closebuttoncolor=${color}`
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
        })
    }
};