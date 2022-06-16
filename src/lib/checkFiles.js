import dialogs from '../components/dialogs';
import fsOperation from './fileSystem/fsOperation';

export default async () => {
  const files = editorManager.files;
  const { editor } = editorManager;

  for (let file of files) {
    if (file.isUnsaved) continue;

    if (file.uri) {
      const fs = fsOperation(file.uri);

      if (!(await fs.exists()) && !file.readOnly) {
        file.isUnsaved = true;
        file.uri = null;
        dialogs.alert(
          strings.info.toUpperCase(),
          strings['file has been deleted'].replace('{file}', file.filename),
        );
        editorManager.onupdate('file-changed');
        editorManager.emit('update', 'file-changed');
        continue;
      }

      const text = await fs.readFile(file.encoding ?? 'utf-8');
      const loadedText = file.session.getValue();

      if (text !== loadedText) {
        try {
          await dialogs.confirm(
            strings.warning.toUpperCase(),
            file.filename + strings['file changed'],
          );

          const cursorPos = editor.getCursorPosition();
          editorManager.switchFile(file.id);

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
