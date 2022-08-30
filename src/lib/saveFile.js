import FileBrowser from '../pages/fileBrowser/fileBrowser';
import dialogs from '../components/dialogs';
import helpers from '../utils/helpers';
import constants from './constants';
import recents from '../lib/recents';
import fsOperation from '../fileSystem/fsOperation';
import Url from '../utils/Url';
import openFolder from './openFolder';

let saveTimeout;

/**
 *
 * @param {File} file
 * @param {boolean} [isSaveAs]
 */
async function saveFile(file, isSaveAs = false) {
  if (file.loading) return;
  let fs;
  let url;
  let { filename } = file;
  let isNewFile = false;
  let createFile = false;
  const data = file.session.getValue();
  const $text = file.tab.querySelector('span.text');
  if (file.type === 'regular' && !file.uri) {
    isNewFile = true;
  } else if (file.uri) {
    isSaveAs = isSaveAs ?? file.readOnly;
  }

  formatFile();

  if (!isSaveAs && !isNewFile) {
    if (file.type === 'git') {
      const values = await dialogs.multiPrompt('Commit', [
        {
          id: 'message',
          placeholder: strings['commit message'],
          value: file.record.commitMessage,
          type: 'text',
          required: true,
        },
        {
          id: 'branch',
          placeholder: strings.branch,
          value: file.record.branch,
          type: 'text',
          required: true,
          hints: (cb) => {
            file.record.repository.listBranches().then((res) => {
              const data = res.data;
              const branches = [];
              data.map((branch) => branches.push(branch.name));
              cb(branches);
            });
          },
        },
      ]);

      if (!values.branch || !values.message) return;
      file.record.branch = values.branch;
      file.record.commitMessage = values.message;
      await file.record.setData(data);
      file.isUnsaved = false;
      editorManager.onupdate('save-file');
      editorManager.emit('save-file', file);
      editorManager.emit('update', 'save-file');
      return;
    }
    if (file.type === 'gist') {
      await file.record.setData(file.filename, data);
      file.isUnsaved = false;
      editorManager.onupdate('save-file');
      editorManager.emit('save-file', file);
      editorManager.emit('update', 'save-file');
      return;
    }
  } else {
    const option = await recents.select(
      [
        ['select-folder', strings['select folder'], 'folder']
      ],
      'dir',
      strings['select folder'],
    );

    if (option === 'select-folder') {
      url = await selectFolder();
    } else {
      url = option.val.url;
    }

    if (isSaveAs) {
      filename = await getfilename(url, file.filename);
    } else {
      filename = await check(url, file.filename);
    }
  }

  createFile = isSaveAs || url;

  if (filename !== file.filename) {
    file.filename = filename;
    formatFile();
  }

  $text.textContent = strings.saving + '...';
  file.isSaving = true;

  try {
    if (createFile) {
      const fileUri = Url.join(url, file.filename);
      fs = fsOperation(fileUri);

      if (!await fs.exists()) {
        const fileDir = fsOperation(url);
        await fileDir.createFile(file.filename);
      }

      const openedFile = editorManager.getFile(fileUri, 'uri');
      if (openedFile) openedFile.uri = null;
      file.uri = fileUri;
      recents.addFile(fileUri);

      const folder = openFolder.find(url);
      if (folder) folder.reload();
    }

    if (!fs) fs = fsOperation(file.uri);
    await fs.writeFile(data);
    if (file.location) {
      recents.addFolder(file.location);
    }

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      file.isSaving = false;
      file.isUnsaved = false;
      // file.onsave();
      if (url) recents.addFile(file.uri);
      editorManager.onupdate('save-file');
      editorManager.emit('update', 'save-file');
      editorManager.emit('save-file', file);
      resetText();
    }, editorManager.TIMEOUT_VALUE + 100);
  } catch (err) {
    helpers.error(err);
  }
  resetText();

  function resetText() {
    setTimeout(() => {
      $text.textContent = file.filename;
    }, editorManager.TIMEOUT_VALUE);
  }

  async function selectFolder() {
    const dir = await FileBrowser(
      'folder',
      strings[`save file${isSaveAs ? ' as' : ''}`],
    );
    return dir.url;
  }

  async function getfilename(url, name) {
    const filename = await dialogs.prompt(
      strings['enter file name'],
      name || '',
      strings['new file'],
      {
        match: constants.FILE_NAME_REGEX,
        required: true,
      },
    );

    return await check(url, filename);
  }

  async function check(url, filename) {
    const pathname = Url.join(url, filename);

    const fs = fsOperation(pathname);
    if (await fs.exists()) {
      const action = await dialogs.select(strings['file already exists'], [
        ['overwrite', strings.overwrite],
        ['newname', strings['enter file name']],
      ]);

      if (action === 'newname') {
        filename = await getfilename(url, filename);
      }
    }

    return filename;
  }

  function formatFile() {
    const { formatOnSave } = appSettings.value;
    if (formatOnSave) {
      editorManager.activeFile.markChanged = false;
      acode.exec('format', false);
    }
  }
}

export default saveFile;
