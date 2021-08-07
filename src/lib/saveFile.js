import FileBrowser from '../pages/fileBrowser/fileBrowser';
import dialogs from '../components/dialogs';
import helpers from "../lib/utils/helpers";
import constants from "./constants";
import recents from '../lib/recents';
import fsOperation from '../lib/fileSystem/fsOperation';
import Url from './utils/Url';

/**
 * 
 * @param {File} file 
 * @param {boolean} [as] 
 * @param {boolean} [showToast] 
 */
function saveFile(file, as = false, showToast = true) {
    beautifyFile();

    let newFile = false;
    if (file.type === 'regular' && !file.location) newFile = true;

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
                                data.map(branch => branches.push(branch.name));
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
                            // else toast(strings.error);
                        });
                });
        } else if (file.type === 'gist') {
            file.record.setData(file.name, file.session.getValue())
                .then(() => {
                    // window.plugins.toast.showLongBottom(strings['file saved']);
                    file.isUnsaved = false;
                    editorManager.onupdate();
                })
                .catch(err => {
                    if (err) dialogs.alert(strings.error, err.toString());
                    // else toast(strings.error);
                });
        } else if (file.uri) {
            save();
        }

    } else {
        let locations;

        try {
            locations = JSON.parse(localStorage.recentlySavedLocations);
        } catch (error) {
            locations = [];
        }

        recents.select([
                ...(locations.map(location => {
                    return [{
                            val: {
                                url: location
                            }
                        },
                        Url.hidePassword(location),
                        "folder"
                    ];
                })),
                ["select-folder", strings["select folder"], "folder"]
            ], "dir", strings["select folder"])
            .then(res => {
                if (res === "select-folder") return selectFolder();
                const url = res.val.url;
                checkFile(url, file.filename)
                    .then(filename => save(url, filename))
                    .catch(error);
            });
    }

    function selectFolder() {
        editorManager.editor.blur();
        FileBrowser('folder', strings['save here'])
            .then(res => {
                let url = file.location === res.url ? undefined : res.url;
                if (as) {
                    newfilename(res.url, file.filename)
                        .then(filename => save(url, filename))
                        .catch(error);
                } else {
                    checkFile(url, file.filename)
                        .then(filename => save(url, filename))
                        .catch(error);
                }
            });
    }

    function error(err) {
        helpers.error(err);
        console.error(err);
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

            fsOperation(url)
                .then(fs => {
                    return fs.createFile(file.filename, data);
                })
                .then(url => {
                    file.type = 'regular';
                    file.uri = url;
                    editorManager.setSubText(file);
                    recents.addFile(url);
                    updateFile();
                })
                .catch(error)
                .finally(() => {
                    resetText();
                });

        } else {

            fsOperation(file.uri)
                .then(fs => {
                    return fs.writeFile(data);
                })
                .then(() => {
                    updateFile();
                })
                .catch(error)
                .finally(() => {
                    resetText();
                });

        }

        function error(err) {
            if (url) file.location = null;
            helpers.error(err);
            console.error(err);
        }

        function resetText() {
            setTimeout(() => {
                $text.textContent = file.filename;
            }, editorManager.TIMEOUT_VALUE);
        }

        function updateFile() {
            if (url) {
                /**
                 * @type {Array<String>}
                 */
                let recentlySavedLocations;
                try {
                    recentlySavedLocations = JSON.parse(localStorage.recentlySavedLocations);
                } catch (e) {
                    recentlySavedLocations = [];
                }

                if (recentlySavedLocations.includes(url))
                    recentlySavedLocations = recentlySavedLocations.filter(location => {
                        return location !== url;
                    });
                if (recentlySavedLocations.length > 4)
                    recentlySavedLocations.pop();

                recentlySavedLocations.unshift(url);
                localStorage.recentlySavedLocations = JSON.stringify(recentlySavedLocations);
            }

            if (window.saveTimeout) clearTimeout(window.saveTimeout);
            if (file.id === constants.DEFAULT_FILE_SESSION) file.id = helpers.uuid();
            window.saveTimeout = setTimeout(() => {
                file.isSaving = false;
                file.isUnsaved = false;
                file.onsave();
                // if (showToast) toast(strings['file saved']);
                if (url) recents.addFile(file.uri);
                editorManager.onFileSave(file);
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
        return new Promise((resolve, reject) => {
            check(url, filename, resolve, reject);
        });
    }


    function check(url, filename, resolve, reject) {
        const pathname = Url.join(url, filename);
        const timeout = setTimeout(() => {
            dialogs.loader.create("", strings.loading + "...");
        }, 50);
        fsOperation(pathname)
            .then(fs => {
                return fs.exists();
            })
            .then(res => {
                if (res) {
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
                } else {
                    resolve(filename);
                }
            })
            .catch(err => {
                reject(err);
            })
            .finally(() => {
                if (timeout) clearTimeout(timeout);
                dialogs.loader.destroy();
            });
    }

    function beautifyFile(name) {
        const ext = helpers.extname(name || file.filename);
        const _beautify = appSettings.value.beautify;
        if (_beautify[0] !== '*' && _beautify.indexOf(ext) < 0)
            Acode.exec("format");
    }
}

export default saveFile;