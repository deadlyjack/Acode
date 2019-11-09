import createEditorFromURI from './createEditorFromURI';
import helpers from "./helpers";

export default HandleIntent;

/** 
 *  
 * @param {object} intent  
 * @param {string} intent.type  
 * @param {ClipItems[]} intent.clipItems 
 * @param {string} intent.data  
 * @param {string} intent.action  
 * @param {string} [intent.fileUri]  
 * @param {string} [intent.error]  
 * @param {string} [intent.filename]  
 * @param {object} [intent.extras]  
 */
function HandleIntent(intent = {}) {
    const type = intent.action.split('.').slice(-1)[0];
    let timeout = null;

    if (!window.isLoading) {
        timeout = setTimeout(() => {
            document.body.classList.add('loading');
        }, 300);
    }

    if (type === 'VIEW') {
        if (!intent.error && intent.fileUri) {
            createEditorFromURI(intent.fileUri).then(stopLoading);
        } else if (intent.error && intent.filename) {
            const url = helpers.convertToFile(intent.data) || intent.data;
            createEditorFromURI({
                dir: url.dir || url,
                name: intent.filename
            }, true).then(stopLoading);
        } else if (intent.error) {
            if (intent.data) {
                let directory = helpers.convertToFile(intent.data);
                let isContentUri = false;
                let name = intent.filename;

                if (!directory && !name) {
                    stopLoading();
                    alert(strings.error.toUpperCase(), strings['unable to open file']);
                    return;
                } else if (!directory && name) {
                    directory = intent.data;
                } else if (directory.dir) {
                    let tmp = directory;
                    directory = directory.dir;
                    if (!name && tmp.name) {
                        name = tmp.name;
                    } else {
                        stopLoading();
                        alert(strings.error.toUpperCase(), strings['unable to open file']);
                        return;
                    }
                }
                createEditorFromURI({
                    directory,
                    name
                }, isContentUri, {
                    readOnly: !!isContentUri
                }).then(stopLoading);
            } else {
                alert(strings.error.toUpperCase(), strings['unable to open file']);
                stopLoading();
            }
        }
    } else if (type === 'SEND') {
        if (intent.fileUri) {
            createEditorFromURI(intent.fileUri);
        } else if (intent.clipItems) {
            const clipItems = intent.clipItems;
            for (let obj of clipItems) {
                if (obj.uri) {
                    const url = obj.uri;
                    let uri = helpers.convertToFile(url);
                    let isContentUri = false;
                    if (!uri) {
                        uri = url;
                        isContentUri = true;
                    }

                    createEditorFromURI(uri, isContentUri);
                    break;
                }
            }
        }
    } else {
        stopLoading();
    }

    function stopLoading() {
        if (timeout) {
            clearTimeout(timeout);
        }
        document.body.classList.remove('loading');
    }
}