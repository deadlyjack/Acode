import constants from './constants';

export default () => {
  const filesToSave = [];
  const folders = [];
  const { activeFile, editor, files } = editorManager;
  const { value: settings } = appSettings;

  for (let file of files) {
    if (file.id === constants.DEFAULT_FILE_SESSION) {
      continue;
    }

    const edit = {
      id: file.id,
      filename: file.name,
      type: file.type,
      uri: file.uri,
      isUnsaved: file.isUnsaved,
      readOnly: file.readOnly,
      mode: file.mode,
      deltedFile: file.deltedFile,
      cursorPos: editor.getCursorPosition(),
      recordid: null,
      isNew: null,
      sha: null,
      editable: file.editable,
      encoding: file.encoding,
      folds: parseFolds(file.session.getAllFolds()),
    };

    if (edit.type === 'git') edit.sha = file.record.sha;
    else if (edit.type === 'gist') {
      edit.recordid = file.record.id;
      edit.isNew = file.record.isNew;
    }

    if (settings.rememberFiles || edit.isUnsaved) filesToSave.push(edit);
  }

  if (settings.rememberFiles && activeFile) {
    localStorage.setItem('lastfile', activeFile.id);
  }

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
  const foldsToSave = [];

  for (let fold of folds) {
    const { range, ranges, placeholder } = fold;
    foldsToSave.push({
      range,
      ranges: parseFolds(ranges),
      placeholder,
    });
  }

  return foldsToSave;
}
