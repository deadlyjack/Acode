import constants from './constants';

export default () => {
  const filesToSave = [];
  const folders = [];
  const { activeFile, editor, files } = editorManager;

  for (let file of files) {
    if (file.id === constants.DEFAULT_FILE_SESSION) {
      continue;
    }

    const edit = {
      id: file.id,
      filename: file.filename,
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
      folds: parseFolds(file.session.getAllFolds()),
    };

    if (edit.type === 'git') edit.sha = file.record.sha;
    else if (edit.type === 'gist') {
      edit.recordid = file.record.id;
      edit.isNew = file.record.isNew;
    }

    filesToSave.push(edit);
  }

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

  if (activeFile) {
    localStorage.setItem('lastfile', activeFile.id);
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
