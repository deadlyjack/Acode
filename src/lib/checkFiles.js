import dialogs from '../components/dialogs';
import fsOperation from '../fileSystem/fsOperation';
import EditorFile from './editorFile';

let checkFileEnabled = true;

Object.defineProperty(checkFiles, 'check', {
  set(value) {
    checkFileEnabled = value;
  },
  get() {
    return checkFileEnabled;
  }
});

export default async function checkFiles() {
  if (checkFileEnabled === false) {
    checkFileEnabled = true;
    return;
  }
  const files = editorManager.files;
  const { editor } = editorManager;

  recursiveFileCheck([...files]);

  /**
   * 
   * @param {EditorFile[]} files 
   */
  async function recursiveFileCheck(files) {
    const file = files.pop();
    await checkFile(file);
    if (files.length) {
      recursiveFileCheck(files);
    }
    return;
  }

  /**
   * 
   * @param {import('./editorFile').default} file
   */
  async function checkFile(file) {
    if (file.isUnsaved || !file.loaded || file.loading) return;

    if (file.uri) {
      const fs = fsOperation(file.uri);

      if (!(await fs.exists()) && !file.readOnly) {
        file.isUnsaved = true;
        file.uri = null;
        editorManager.onupdate('file-changed');
        editorManager.emit('update', 'file-changed');
        await new Promise((resolve) => {
          dialogs.alert(
            strings.info,
            strings['file has been deleted'].replace('{file}', file.filename),
            resolve,
          );
        });
        return;
      }

      const text = await fs.readFile(file.encoding ?? 'utf-8');
      const loadedText = file.session.getValue();

      if (text !== loadedText) {
        try {
          const confirmation = await dialogs.confirm(
            strings.warning.toUpperCase(),
            file.filename + strings['file changed'],
          );

          if (!confirmation) return;

          const cursorPos = editor.getCursorPosition();
          editorManager.getFile(file.id, 'id')?.makeActive();

          file.markChanged = false;
          file.session.setValue(text);
          editor.gotoLine(cursorPos.row, cursorPos.column);
          editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
        } catch (error) { }
      }
    }
  }

  if (!editorManager.activeFile) {
    app.focus();
  }
};
