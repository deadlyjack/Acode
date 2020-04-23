import FileBrowser from '../pages/fileBrowser/fileBrowser';
import dialogs from '../components/dialogs';
import helpers from "../lib/helpers";
import constants from "./constants";
import recents from '../lib/recents';
import fsOperation from '../lib/fileSystem/fsOperation';

/**
 * 
 * @param {File} file 
 * @param {boolean} [as] 
 * @param {boolean} [showToast] 
 */
function saveFile(file, as = false, showToast = true) {
    beautifyFile();

    let newFile = false;
    if (file.type === 'regular' && !file.location && !file.contentUri) newFile = true;

    if (!as && !newFile) {

        if (file.type === 'git') {
            dialogs.multiPrompt('Commit', [{
                    id: 'message',
                    placeholder: strings['commit message'],
                    value: file.record.commitMessage,
                    type: 'text',
                    required: true,
                }, {
                    id: 'branch',
                    placeholder: strings.branch,
                    value: file.record.branch,
                    type: 'text',
                    required: true,
                    hints: cb => {
                        file.record.repository.listBranches()
                            .then(res => {
                                const data = res.data;
                                const branches = [];
                                data.map(branch => {
                                    branches.push(branch.name);
                                    return branch;
                                });
                                cb(branches);
                            });
                    }
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
                        .catch((err) => {
                            if (err) dialogs.alert(strings.error, err.toString());
                            else window.plugins.toast.showShortBottom(strings.error);
                        });
                });
        } else if (file.type === 'gist') {
            file.record.setData(file.name, file.session.getValue())
                .then(() => {
                    window.plugins.toast.showLongBottom(strings['file saved']);
                    file.isUnsaved = false;
                    editorManager.onupdate();
                })
                .catch(err => {
                    if (err) dialogs.alert(strings.error, err.toString());
                    else window.plugins.toast.showShortBottom(strings.error);
                });
        } else if (file.fileUri || file.contentUri) {
            save();
        }

    } else {

        editorManager.editor.blur();
        FileBrowser('folder', strings['save here'])
            .then(res => {
                let url = file.location === res.url ? undefined : res.url;
                if (as) {
                    newfilename(res.url, file.filename)
                        .then(filename => {
                            save(url, filename);
                        });
                } else {
                    checkFile(url, file.filename)
                        .then((filename) => {
                            save(url, filename);
                        });
                }
            });
    }

    /**
     * 
     * @param {File} file 
     * @param {string} [url] 
     * @param {string} [filename]
     * @param {boolean} [canWrite]
     * @param {string} [uuid]
     * @param {string} [origin]
     */
    function save(url, filename) {
        const data = file.session.getValue();
        let createFile = false || as;
        if (url) {
            file.type = 'regular';
            file.record = null;
            file.location = helpers.decodeURL(url);
        }
        if (filename) {
            if (filename.overwrite) {
                filename = filename.filename;
            } else if (url) {
                createFile = true;
            }
            file.filename = filename;
            beautifyFile();
        }

        const $text = file.assocTile.querySelector('span.text');
        $text.textContent = strings.saving + '...';
        file.isSaving = true;
        if (createFile) {

            fsOperation(file.location)
                .then(fs => {
                    return fs.createFile(file.filename);
                })
                .then(() => {
                    return fsOperation(file.fileUri);
                })
                .then(fs => {
                    return fs.writeFile(data);
                })
                .then(() => {
                    return updateFile();
                })
                .catch(err => {
                    helpers.error(err);
                    console.error(err);
                })
                .finally(() => {
                    resetText();
                    file.isSaving = false;
                });

        } else {

            fsOperation(file.fileUri || file.contentUri)
                .then(fs => {
                    return fs.writeFile(data);
                })
                .then(() => {
                    return updateFile();
                })
                .catch(err => {
                    helpers.error(err);
                    console.error(err);
                })
                .finally(() => {
                    resetText();
                    file.isSaving = false;
                });

        }

        function resetText() {
            $text.textContent = file.filename;
        }

        function updateFile() {
            if (window.saveTimeout) clearTimeout(window.saveTimeout);
            if (file.id === constants.DEFAULT_SESSION) file.id = helpers.uuid();
            window.saveTimeout = setTimeout(() => {
                file.isUnsaved = false;
                if (showToast) window.plugins.toast.showShortBottom(strings['file saved']);
                if (url) {
                    helpers.updateFolders(file.location);
                    recents.addFile(file.fileUri);
                }
                editorManager.onupdate();
                resetText();
            }, editorManager.TIMEOUT_VALUE + 100);
        }
    }

    /**
     * 
     * @param {string} url 
     */
    function newfilename(url, name) {
        return new Promise((resolve) => {
            getfilename(resolve, url, name);
        });
    }

    function getfilename(resolve, url, name) {
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
                        getfilename(resolve, url, filename);
                    }
                });
            return;
        }, function (err) {
            if (err.code === 1) resolve(filename);
        });
    }

    function beautifyFile(name) {
        const ext = helpers.getExt(name || file.filename);
        const _beautify = appSettings.value.beautify;
        if (_beautify[0] !== '*' && _beautify.indexOf(ext) < 0)
            Acode.exec("format");
    }
}

export default saveFile;