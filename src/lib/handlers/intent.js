import createEditorFromURI from '../createEditorFromURI';
import helpers from "../utils/helpers";
import dialogs from '../../components/dialogs';

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

    timeout = setTimeout(() => {
        dialogs.loaderShow(strings.loading + '...');
    }, 300);

    if (type === 'VIEW') {

        if (intent.fileUri) {

            window.resolveLocalFileSystemURL(intent.fileUri, () => {

                createEditorFromURI({
                    fileUri: intent.fileUri,
                    contentUri: intent.data,
                    name: intent.filename
                }).then(stopLoading);

            }, () => {

                checkAndCreate();

            });

        } else if (intent.data) {

            checkAndCreate();

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

    function checkAndCreate() {
        helpers.convertToFile(intent.data)
            .then(url => {
                return createEditorFromURI({
                    name: intent.filename,
                    fileUri: url,
                    contentUri: intent.data
                }, false);
            })
            .catch(() => {
                return createEditorFromURI({
                    contentUri: intent.data,
                    name: intent.filename
                }, true);
            })
            .finally(stopLoading);
    }

    function stopLoading() {
        if (timeout) {
            clearTimeout(timeout);
        }
        dialogs.loaderHide();
    }
}