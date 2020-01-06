import fs from "./utils/androidFileSystem";
import helpers from "./helpers";
import {
    lookup
} from 'mime-types';
import dialogs from "../components/dialogs";

export default createEditorFromURI;
/**
 * 
 * @param {string|fileOptions} uri 
 * @param {boolean} isContentUri 
 * @param {string} data
 */

function createEditorFromURI(uri, isContentUri, data = {}) {
    return new Promise(resolve => {
        uri = decode(uri);
        if (typeof uri === 'string') {
            const name = uri.split('/').pop();
            const dir = uri.replace(name, '');

            uri = {
                dir,
                name
            };
        }
        const name = uri.name;
        const ext = helpers.getExt(name);
        const location = isContentUri ? null : uri.dir;
        const fileUri = location ? location + name : null;
        const contentUri = isContentUri ? uri.dir : null;
        const settings = appSettings.value;
        const {
            cursorPos,
            render,
            readOnly,
            index,
            timeout
        } = data;

        const existingFile = editorManager.getFile(fileUri);
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
                isUnsaved: true,
                readOnly
            });
            resolve(index === undefined ? fileUri : index);
            return;
        }

        fs.readFile(fileUri || contentUri)
            .then(res => {
                /**
                 * @type {ArrayBuffer}
                 */
                const data = res.data;
                const size = res.file && res.file.size || data.byteLength;

                if (size * 0.000001 > settings.maxFileSize) {
                    return alert(strings.error.toUpperCase(), `${strings['file too large']} ${settings.maxFileSize}MB`);
                }

                const decoder = new TextDecoder("utf-8");
                const text = decoder.decode(data);

                if (/[\x00-\x08\x0E-\x1F]/.test(text)) {
                    if (/image/i.test(lookup(name))) {
                        const reader = new FileReader();
                        reader.readAsDataURL(new Blob([data]));
                        reader.onloadend = function () {
                            dialogs.box(name, `<img src='${reader.result}'>`);
                        }
                        return;
                    }
                    if (timeout) clearTimeout(timeout);
                    document.body.classList.remove('loading');
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
                    render,
                    readOnly
                });

                resolve(index === undefined ? fileUri : index);
            })
            .catch(err => {
                if (err.code) {
                    alert(strings.error.toUpperCase(), `${strings['unable to open file']} (${helpers.getErrorMessage(err.code)}).`);
                }
                console.error(err);

                resolve(index === undefined ? fileUri : index);
            });
    });
}

function decode(url) {
    if (/%[0-9a-f]{2}/i.test(url)) return decode(decodeURI(url));
    return url;
}