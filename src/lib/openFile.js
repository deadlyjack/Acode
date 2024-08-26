import recents from './recents';
import fsOperation from 'fileSystem';
import EditorFile from './editorFile';
import appSettings from './settings';
import loader from 'dialogs/loader';
import alert from 'dialogs/alert';
import box from 'dialogs/box';
import confirm from 'dialogs/confirm';
import { decode } from 'utils/encodings';
import { reopenWithNewEncoding } from 'palettes/changeEncoding';

/**
 * @typedef {object} FileOptions
 * @property {string} text
 * @property {{ row: number, column: number }} cursorPos
 * @property {boolean} render
 * @property {function} onsave
 * @property {string} encoding
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
    const { cursorPos, render, onsave, text, mode, encoding } = options;

    if (existingFile) {
      // If file is already opened and new text is provided
      const existingText = existingFile.session.getValue();
      const existingCursorPos = existingFile.session.selection.getCursor();

      // If file is already opened
      existingFile.makeActive();

      if (onsave) {
        existingFile.onsave = onsave;
      }


      if (text && existingText !== text) {
        // let confirmation = true;
        // if (existingFile.isUnsaved) {
        //   const message = strings['reopen file'].replace('{file}', existingFile.filename);
        //   confirmation = await confirm(strings.warning, message);
        // }
        // if (confirmation) {
        // }
        existingFile.session.setValue(text);
      }

      if (cursorPos && existingCursorPos.row !== cursorPos.row && existingCursorPos.column !== cursorPos.column) {
        existingFile.session.selection.moveCursorTo(cursorPos.row, cursorPos.column);
      }

      if (encoding && existingFile.encoding !== encoding) {
        reopenWithNewEncoding(encoding);
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
        encoding,
        SAFMode: mode,
      });
    };

    if (text) {
      // If file is not opened and has unsaved text
      createEditor(true, text);
      return;
    }

    const videoRegex = /\.(mp4|webm|ogg)$/i;
    const imageRegex = /\.(jpe?g|png|gif|webp)$/i;
    const audioRegex = /\.(mp3|wav|ogg)$/i;

    if (videoRegex.test(name)) {
      const objectUrl = await fileToDataUrl(uri);
      box(name, `<video src="${objectUrl}" controls autoplay loop style="max-width: 100%; max-height: 100%;"></video>`);
      return;
    }

    if (imageRegex.test(name)) {
      const objectUrl = await fileToDataUrl(uri);
      box(name, `<img src="${objectUrl}" style="max-width: 100%; max-height: 100%;" />`);
      return;
    }

    if (audioRegex.test(name)) {
      const objectUrl = await fileToDataUrl(uri);
      box(name, `<audio src="${objectUrl}" controls autoplay loop style="max-width: 100%; max-height: 100%;"></audio>`);
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
    const fileContent = await decode(binData, file.encoding || appSettings.value.defaultFileEncoding);

    if (/[\x00-\x08\x0E-\x1F]/.test(fileContent)) {
      const confirmation = await confirm(strings.info, strings['binary file']);
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

/**
 * Converts file to data url
 * @param {string} file file url
 */
async function fileToDataUrl(file) {
  const fs = fsOperation(file);
  const fileInfo = await fs.stat();
  const binData = await fs.readFile();
  return URL.createObjectURL(new Blob([binData], { type: fileInfo.mime }));
}
