import helpers from '../utils/helpers';
import dialogs from '../components/dialogs';
import recents from './recents';
import fsOperation from '../fileSystem';
import EditorFile from './editorFile';
import appSettings from './settings';
import loader from 'components/dialogs/loader';

/**
 * @typedef {object} FileOptions
 * @property {string} text
 * @property {{ row: number, column: number }} cursorPos
 * @property {boolean} render
 * @property {function} onsave
 * @property {string} mode
 * @property {string} uri
 */

/**
 * Opens a editor file
 * @param {String & FileOptions} file
 * @param {FileOptions} options
 */

export default async function openFile(file, options = {}) {
  try {
    let uri = typeof file === 'string' ? file : file.uri;
    if (!uri) return;

    /**@type {EditorFile} */
    const existingFile = editorManager.getFile(uri, 'uri');
    const { cursorPos, render, onsave, text, mode } = options;

    if (existingFile) {
      // If file is already opened
      existingFile.makeActive();
      if (onsave) {
        existingFile.onsave = onsave;
      }
      if (mode) {
        existingFile.SAFMode = mode;
      }
      if (text) {
        existingFile.session.setValue(text);
      }
      if (cursorPos) {
        existingFile.session.selection.moveCursorTo(cursorPos.row, cursorPos.column);
      }
      return;
    }

    loader.showTitleLoader();
    const settings = appSettings.value;
    const fs = fsOperation(uri);
    const fileInfo = await fs.stat();
    const name = fileInfo.name || file.filename || uri;
    const readOnly = fileInfo.canWrite ? false : true;
    const createEditor = (isUnsaved, text) => {
      new EditorFile(name, {
        uri,
        text,
        cursorPos,
        isUnsaved,
        render,
        onsave,
        readOnly,
        SAFMode: mode,
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

    if (/[\x00-\x08\x0E-\x1F]/.test(fileContent)) {
      if (/image/i.test(fileInfo.type)) {
        const blob = new Blob([binData], { type: fileInfo.type });
        dialogs.box(name, `<img src='${URL.createObjectURL(blob)}'>`);
        return;
      } else if (/video/i.test(fileInfo.type)) {
        const blob = new Blob([binData], { type: fileInfo.type });
        dialogs.box(name, `<video src='${URL.createObjectURL(blob)}' controls></video>`);
        return;
      }

      const confirmation = await dialogs.confirm(strings.info, strings['binary file']);
      if (!confirmation) return;
    }

    createEditor(false, fileContent);
    if (mode !== 'single') recents.addFile(uri);
    return;
  } catch (error) {
    console.error(error);
  } finally {
    loader.removeTitleLoader();
  }
}
