import helpers from './utils/helpers';
import dialogs from '../components/dialogs';
import recents from './recents';
import fsOperation from './fileSystem/fsOperation';

/**
 *
 * @param {String & fileOptions} file
 * @param {object} data
 */

export default async function openFile(file, data = {}) {
  try {
    let uri = file.uri || file;
    if (!uri && typeof uri !== 'string') return;

    const existingFile = editorManager.getFile(uri, 'uri');

    if (existingFile) {
      // If file is already opened
      editorManager.switchFile(existingFile.id);
      return;
    }

    helpers.showTitleLoader();
    const fs = fsOperation(uri);
    const fileInfo = await fs.stat().catch((err) => {
      console.error("Error while getting file info", err);
    });
    const name = fileInfo.name || file.name || uri;
    const settings = appSettings.value;
    const readOnly = fileInfo.canWrite ? false : true;
    const { cursorPos, render, onsave, text, mode } = data;
    const createEditor = (isUnsaved, text) => {
      editorManager.addNewFile(name, {
        uri,
        text,
        cursorPos,
        isUnsaved,
        render,
        onsave,
        readOnly,
        mode,
      });
    };

    if (text) {
      // If file is not opened and has unsaved text
      helpers.removeTitleLoader();
      createEditor(true, text);
      return;
    }

    // Else open a new file
    // Checks for valid file
    const ext = helpers.extname(name);
    if (appSettings.isFileAllowed(ext)) {
      helpers.removeTitleLoader();
      return alert(
        strings.notice.toUpperCase(),
        `'${ext}' ${strings['file is not supported']}`,
      );
    } else if (fileInfo.length * 0.000001 > settings.maxFileSize) {
      helpers.removeTitleLoader();
      return alert(
        strings.error.toUpperCase(),
        strings['file too large'].replace(
          '{size}',
          settings.maxFileSize + 'MB',
        ),
      );
    }

    const binData = await fs.readFile().catch((err) => {
      console.error("Error while reading file", err);
    });
    const fileContent = helpers.decodeText(binData);

    helpers.removeTitleLoader();
    if (helpers.isBinary(fileContent) && /image/i.test(fileInfo.type)) {
      const blob = new Blob([binData]);
      dialogs.box(name, `<img src='${URL.createObjectURL(blob)}'>`);
      return;
    }

    createEditor(false, fileContent);
    if (mode !== 'single') recents.addFile(uri);
    return;
  } catch (error) {
    helpers.removeTitleLoader();
    console.error(error);
  }
}
