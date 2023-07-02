import constants from './constants';
import { addedFolder } from './openFolder';
import appSettings from './settings';

export default () => {
  const filesToSave = [];
  const folders = [];
  const { editor, files, activeFile } = editorManager;
  const { value: settings } = appSettings;

  files.forEach((file) => {
    if (file.id === constants.DEFAULT_FILE_SESSION) return;

    const fileJson = {
      id: file.id,
      uri: file.uri,
      type: file.type,
      filename: file.filename,
      isUnsaved: file.isUnsaved,
      readOnly: file.readOnly,
      SAFMode: file.SAFMode,
      deletedFile: file.deletedFile,
      cursorPos: editor.getCursorPosition(),
      scrollTop: editor.session.getScrollTop(),
      scrollLeft: editor.session.getScrollLeft(),
      editable: file.editable,
      encoding: file.encoding,
      render: activeFile.id === file.id,
      folds: parseFolds(file.session.getAllFolds()),
    };

    if (settings.rememberFiles || fileJson.isUnsaved) filesToSave.push(fileJson);
  });

  if (settings.rememberFolders) {
    addedFolder.forEach((folder) => {
      const { url, saveState, title, listState } = folder;
      folders.push({
        url,
        opts: {
          saveState,
          name: title,
          listState,
        },
      });
    });
  }

  localStorage.files = JSON.stringify(filesToSave);
  localStorage.folders = JSON.stringify(folders);
};

function parseFolds(folds) {
  return folds.map((fold) => {
    const { range, ranges, placeholder } = fold;
    return {
      range,
      ranges: parseFolds(ranges),
      placeholder,
    };
  });
}
