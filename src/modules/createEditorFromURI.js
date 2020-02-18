import fs from "./utils/internalFs";
import helpers from "./helpers";
import {
    lookup
} from 'mime-types';
import dialogs from "../components/dialogs";
import recents from "./recents";

export default createEditorFromURI;
/**
 * 
 * @param {string|fileOptions} uri 
 * @param {boolean} isContentUri 
 * @param {object} data
 */

function createEditorFromURI(uri, isContentUri, data = {}) {
    return new Promise(resolve => {
        let name, location, fileUri, contentUri;

        if (typeof uri === 'string') {
            uri = helpers.decodeURL(uri);

            name = uri.split('/').pop();

            if (!isContentUri) {
                location = helpers.getPath(uri, name);
                fileUri = uri;
            } else {
                contentUri = uri;
            }

        } else {
            name = uri.name;
            fileUri = helpers.decodeURL(uri.fileUri);
            contentUri = helpers.decodeURL(uri.contentUri);

            if (fileUri) {
                if (!name)
                    name = name = fileUri.split('/').pop();
                location = helpers.getPath(fileUri, name);
            }
        }
        const settings = appSettings.value;
        const {
            cursorPos,
            render,
            index
        } = data;

        const existingFile = editorManager.getFile(fileUri, "fileUri");
        if (existingFile) {
            editorManager.switchFile(existingFile.id);
            resolve(fileUri);
            return;
        }

        if (data.text) {
            editorManager.addNewFile(name, {
                contentUri,
                fileUri,
                location,
                render,
                text: data.text,
                cursorPos: data.cursorPos,
                isUnsaved: true
            });
            resolve(index === undefined ? fileUri : index);
            return;
        }

        if (!fileUri)
            dialogs.loaderShow(strings.loading + "...");
        fs.readFile(fileUri || contentUri)
            .then(createFile)
            .catch(err => {

                if (fileUri && contentUri) {
                    dialogs.loaderShow(strings.loading + '...');
                    fs.readFile(contentUri)
                        .then(createFile)
                        .then(err => {
                            resolve(index === undefined ? fileUri || contentUri : index);
                        })
                        .finally(dialogs.loaderHide);
                } else {
                    helpers.error(err);
                    console.log(err);
                }

                resolve(index === undefined ? fileUri || contentUri : index);
            })
            .finally(dialogs.loaderHide);


        /**
         * 
         * @param {object} res 
         * @param {ArrayBuffer} res.data 
         */
        function createFile(res) {

            const data = res.data;
            const size = res.file && res.file.size || data.byteLength;

            if (size * 0.000001 > settings.maxFileSize) {
                return alert(strings.error.toUpperCase(), `${strings['file too large']} ${settings.maxFileSize}MB`);
            }

            const decoder = new TextDecoder("utf-8");
            const text = decoder.decode(data);

            if (helpers.isBinary(text)) {
                if (/image/i.test(lookup(name))) {
                    const blob = new Blob([data]);
                    dialogs.box(name, `<img src='${URL.createObjectURL(blob)}'>`);
                    return;
                }
                if (timeout) clearTimeout(timeout);
                return alert(strings.error.toUpperCase(), strings['file not supported']);
            }

            editorManager.addNewFile(name, {
                fileUri,
                contentUri,
                isContentUri,
                location,
                cursorPos,
                text,
                isUnsaved: false,
                render
            });

            recents.addFile(fileUri);

            resolve(index === undefined ? fileUri : index);
        }
    });
}