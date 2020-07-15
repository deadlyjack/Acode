import helpers from "./utils/helpers";
import dialogs from "../components/dialogs";
import recents from "./recents";
import fsOperation from "./fileSystem/fsOperation";

/**
 * 
 * @param {string|fileOptions} file 
 * @param {object} data
 */
async function open(file, data = {}) {
    let name, uri;

    if (typeof file === 'object') {
        name = file.name;
        uri = file.uri;
    } else {
        uri = file;
    }

    if (!uri) return;

    const fs = await fsOperation(uri);
    const fileInfo = await fs.stats();
    const settings = appSettings.value;
    const readOnly = fileInfo.canWrite ? false : true;
    const {
        cursorPos,
        render,
        index,
        onsave
    } = data;

    if (!name) name = fileInfo.name;

    let existingFile;

    if (uri) existingFile = editorManager.getFile(uri, "uri");

    if (existingFile) {
        editorManager.switchFile(existingFile.id);
        return index === undefined ? uri : index;
    } else if (data.text) {
        editorManager.addNewFile(name, {
            uri,
            render,
            text: data.text,
            cursorPos: data.cursorPos,
            isUnsaved: true,
            onsave,
            readonly: readOnly
        });
        return index === undefined ? uri : index;
    } else {
        const ext = helpers.extname(name);
        if (appSettings.defaultSettings.filesNotAllowed.includes((ext || '').toLowerCase())) {
            dialogs.loader.destroy();
            return alert(strings.notice.toUpperCase(), `'${ext}' ${strings['file is not supported']}`);
        } else if (fileInfo.length * 0.000001 > settings.maxFileSize) {
            dialogs.loader.destroy();
            return alert(strings.error.toUpperCase(), strings['file too large'].replace("{size}", settings.maxFileSize + "MB"));
        }

        const binData = await fs.readFile();
        const text = helpers.decodeText(binData);

        if (helpers.isBinary(text) && /image/i.test(fileInfo.type)) {
            const blob = new Blob([binData]);
            dialogs.box(name, `<img src='${URL.createObjectURL(blob)}'>`);
            return;
        }

        editorManager.addNewFile(name, {
            uri,
            cursorPos,
            text,
            isUnsaved: false,
            render,
            onsave,
            readonly: readOnly
        });

        recents.addFile(uri);
        return index === undefined ? uri : index;
    }
}

export default function openFile(uri, data = {}) {

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            dialogs.loader.create(strings.loading + "...");
        }, 100);

        open(uri, data)
            .then(resolve)
            .catch(err => {
                if (data.index !== undefined) resolve(data.index);
                else reject(err);
            })
            .finally(() => {
                clearTimeout(timeout);
                dialogs.loader.destroy();
            });
    });
}