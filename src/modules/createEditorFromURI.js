import fs from "./utils/androidFileSystem";
import helpers from "./helpers";

export default createEditorFromURI;
/**
 * 
 * @param {string|fileOptions} uri 
 * @param {boolean} isContentUri 
 * @param {string} data
 */

function createEditorFromURI(uri, isContentUri, data = {}) {
    return new Promise(resolve => {
        if (typeof uri === 'string') {
            const name = decodeURI(uri.split('/').pop());
            const dir = uri.replace(encodeURI(name), '');

            uri = {
                dir,
                name
            };
        }
        const name = uri.name;
        const ext = helpers.getExt(name);
        const location = isContentUri ? null : uri.dir;
        const fileUri = location ? location + encodeURI(name) : null;
        const contentUri = isContentUri ? uri.dir : null;
        const settings = appSettings.value;
        const {
            cursorPos,
            render,
            readOnly,
            index,
            timeout
        } = data;

        if (settings.filesNotAllowed.includes(ext)) {
            return alert(strings.notice, `'${ext}' ${strings['file is not supported']}`);
        }

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