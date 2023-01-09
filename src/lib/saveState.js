import constants from './constants';
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
      filename: file.filename,
      type: file.type,
      uri: file.uri,
      isUnsaved: file.isUnsaved,
      readOnly: file.readOnly,
      SAFMode: file.SAFMode,
      deltedFile: file.deltedFile,
      cursorPos: editor.getCursorPosition(),
      scrollTop: editor.session.getScrollTop(),
      scrollLeft: editor.session.getScrollLeft(),
      editable: file.editable,
      encoding: file.encoding,
      render: activeFile.id === file.id,
      folds: parseFolds(file.session.getAllFolds()),
    };

    if (fileJson.type === 'git') fileJson.sha = file.record.sha;
    else if (fileJson.type === 'gist') {
      fileJson.recordid = file.record.id;
      fileJson.isNew = file.record.isNew;
    }

    if (settings.rememberFiles || fileJson.isUnsaved) filesToSave.push(fileJson);
  });

  if (settings.rememberFolders) {
    addedFolder.forEach((folder) => {
      const { url, reloadOnResume, saveState, title } = folder;
      folders.push({
        url,
        opts: {
          saveState,
          reloadOnResume,
          name: title,
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
