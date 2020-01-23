import FileBrowser from '../pages/fileBrowser/fileBrowser';
import dialogs from '../components/dialogs';
import helpers from "./helpers";
import fs from './utils/androidFileSystem';
import constants from "../constants";

/**
 * 
 * @param {File} file 
 * @param {boolean} [as] 
 * @param {boolean} [showToast] 
 */
function saveFile(file, as = false, showToast = true) {

    if (!as) {

        if (file.type === 'git') {
            dialogs.multiPrompt('Commit', [{
                    id: 'message',
                    placeholder: 'Commit message',
                    value: file.record.commitMessage,
                    type: 'text',
                    required: true,
                }, {
                    id: 'branch',
                    placeholder: 'Branch',
                    value: file.record.branch,
                    type: 'text',
                    required: true
                }])
                .then(res => {
                    if (!res.branch || !res.message) return;
                    file.record.branch = res.branch;
                    file.record.commitMessage = res.message;
                    file.record.setData(file.session.getValue())
                        .then(() => {
                            file.isUnsaved = false;
                            editorManager.onupdate();
                        })
                        .catch(() => {
                            window.plugins.toast.showShortBottom(strings.error);
                        });
                });
        } else if (file.type === 'gist') {
            file.record.setData(file.name, file.session.getValue())
                .then(() => {
                    file.isUnsaved = false;
                    editorManager.onupdate();
                })
                .catch(err => {
                    console.log(err);
                    dialogs.alert(strings.error, err.toString());
                });
        } else if (file.contentUri) {
            alert(strings.warning.toUpperCase(), strings["read only file"]);
        } else if (file.fileUri) {
            save(file, undefined, undefined, showToast);
        }

    } else {

        editorManager.editor.blur();
        FileBrowser('folder', strings['save here'])
            .then(res => {
                let url = file.location === res.url ? undefined : res.url;
                if (as) {
                    newfilename(res.url, file.filename)
                        .then(filename => {
                            save(file, url, filename);
                        });
                } else {
                    checkFile(url, file.filename)
                        .then((filename) => {
                            save(file, url, filename);
                        });
                }
            });
    }

    /**
     * 
     * @param {File} file 
     * @param {string} [url] 
     * @param {string} [filename]
     */
    function save(file, url, filename) {
        const editor = editorManager.editor;
        const ext = helpers.getExt(filename || file.filename);
        const _beautify = appSettings.value.beautify;
        if (_beautify[0] !== '*' && _beautify.indexOf(ext) < 0) {
            let pos = editor.getCursorPosition();
            const tmp = editorManager.onupdate;
            editorManager.onupdate = () => {};
            beautify(file.session);
            editorManager.onupdate = tmp;
            editor.gotoLine(pos.row + 1, pos.column);
        }

        const data = file.session.getValue();
        let exclusive = false;
        if (url) {
            exclusive = true;
            file.location = url;
            file.type = 'regular';
            file.record = null;
        }
        if (filename) {
            if (filename.overwrite) {
                exclusive = false;
                filename = filename.filename;
            } else {
                exclusive = true;
            }
            file.filename = filename;
        }

        fs.writeFile(file.fileUri, data, true, exclusive)
            .then(() => {
                file.isUnsaved = false;
                if (showToast) window.plugins.toast.showShortBottom(strings['file saved']);
                if (url) helpers.updateFolders(file.fileUri);
                editorManager.onupdate();
            })
            .catch(error);
    }

    /**
     * 
     * @param {string} url 
     */
    function newfilename(url, name) {
        return new Promise((resolve) => {
            getfilename(resolve);
        });

        function getfilename(resolve) {
            dialogs.prompt(strings['enter file name'], name || '', strings['new file'], {
                    match: constants.FILE_NAME_REGEX,
                    required: true,
                })
                .then(filename => {
                    if (filename) {
                        check(url, filename, resolve);
                    }
                });
        }
    }

    function checkFile(url, filename) {
        return new Promise(resolve => {
            check(url, filename, resolve);
        });
    }


    function check(url, filename, resolve) {
        window.resolveLocalFileSystemURL(url + filename, function (entry) {
            dialogs.select(strings["file already exists"], [
                    ['overwrite', strings.overwrite],
                    ['newname', strings['enter file name']]
                ])
                .then(res => {
                    if (res === 'overwrite') {
                        resolve({
                            overwrite: true,
                            filename
                        });
                    } else {
                        getfilename(resolve);
                    }
                });
            return;
        }, function (err) {
            if (err.code === 1) resolve(filename);
        });
    }

    function error(err) {
        if (err.code)
            alert(strings.error.toUpperCase(), `${strings['unable to save file']}. ${helpers.getErrorMessage(err.code)}`);
        else
            console.log(err);
    }
}

export default saveFile;