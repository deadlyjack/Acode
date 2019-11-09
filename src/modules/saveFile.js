import FileBrowser from '../page/fileBrowser';
import dialogs from '../components/dialogs';
import helpers from "./helpers";
import fs from './androidFileSystem';
import constants from "../constants";

/**
 * 
 * @param {File} file 
 * @param {boolean} [as] 
 */
function saveFile(file, as) {
    if (file.contentUri && !as)
        return alert(strings.warning.toUpperCase(), strings["read only file"]);

    if (file.filename === 'untitled' && !file.location) as = true;

    if (file.fileUri && !as) {
        save(file);
    } else {
        FileBrowser('folder', strings['save here'])
            .then(res => {
                let url = file.location === res.url ? undefined : res.url;
                if (as) {
                    newfilename(res.url, file.filename)
                        .then(filename => {
                            save(file, url, filename);
                        });
                } else {
                    save(file, url);
                }
            });
    }
}

/**
 * 
 * @param {File} file 
 * @param {string} [url] 
 * @param {string} [filename ]
 */
function save(file, url, filename) {
    const editor = editorManager.editor;
    if (appSettings.value.beautify) {
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
            window.plugins.toast.showShortBottom(strings['file saved']);
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
        dialogs.prompt(strings['enter file name'], name || '', "filename", {
                match: constants.FILE_NAME_REGEX,
                required: true,
            })
            .then(filename => {
                if (filename) {
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
            });
    }
}

function error(err) {
    if (err.code)
        alert(strings.error.toUpperCase(), `${strings['unable to save file']}. ${helpers.getErrorMessage(err.code)}`);
    else
        console.log(err);
}

export default saveFile;