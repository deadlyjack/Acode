import helpers from '../utils/helpers';
import dialogs from '../components/dialogs';
import recents from './recents';
import fsOperation from '../fileSystem/fsOperation';
import EditorFile from './editorFile';

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
      existingFile.makeActive();
      return;
    }

    helpers.showTitleLoader();
    const fs = fsOperation(uri);
    const fileInfo = await fs.stat();
    const name = fileInfo.name || file.filename || uri;
    const settings = appSettings.value;
    const readOnly = fileInfo.canWrite ? false : true;
    const { cursorPos, render, onsave, text, mode } = data;
    const createEditor = (isUnsaved, text) => {
      new EditorFile(name, {
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
      createEditor(true, text);
      return;
    }

    // Else open a new file
    // Checks for valid file
    if (fileInfo.length * 0.000001 > settings.maxFileSize) {
      return alert(
        strings.error.toUpperCase(),
        strings['file too large'].replace(
          '{size}',
          settings.maxFileSize + 'MB',
        ),
      );
    }

    const binData = await fs.readFile();
    const fileContent = helpers.decodeText(binData);

    if (helpers.isBinary(fileContent)) {
      const blob = new Blob([binData]);
      if (/image/i.test(fileInfo.type)) {
        dialogs.box(name, `<img src='${URL.createObjectURL(blob)}'>`);
        return;
      }

      dialogs.alert(strings.info.toUpperCase(), 'Cannot open binary file');
      return;
    }

    createEditor(false, fileContent);
    if (mode !== 'single') recents.addFile(uri);
    return;
  } catch (error) {
    console.error(error);
  } finally {
    helpers.removeTitleLoader();
  }
}
