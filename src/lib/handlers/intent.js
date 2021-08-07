import openFile from '../openFile';
// import helpers from "../utils/helpers";
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
        dialogs.loader.create(strings.loading + '...');
    }, 300);

    intent.fileUri = null;
    // if (intent.fileUri) intent.fileUri = decodeURL(intent.fileUri);

    if (["SEND", "VIEW", "EDIT"].includes(type)) {

        return openFile({
            name: intent.filename,
            uri: intent.data || intent.fileUri
        }).then(stopLoading);

        // if (intent.fileUri) {

        //     window.resolveLocalFileSystemURL(intent.fileUri, () => {

        //         openFile({
        //             uri: intent.fileUri || intent.data,
        //             name: intent.filename
        //         }).then(stopLoading);

        //     }, () => {

        //         checkAndCreate();

        //     });

        // } else if (intent.data) {

        //     checkAndCreate();

        // }
    } else {
        stopLoading();
    }

    // function checkAndCreate() {
    //     helpers.convertToFile(intent.data)
    //         .then(url => {
    //             return openFile({
    //                 name: intent.filename,
    //                 uri: url || intent.data
    //             });
    //         })
    //         .catch(() => {
    //             return openFile({
    //                 name: intent.filename,
    //                 uri: intent.data
    //             });
    //         })
    //         .finally(stopLoading);
    // }

    function stopLoading() {
        if (timeout) {
            clearTimeout(timeout);
        }
        dialogs.loader.destroy();
    }
}