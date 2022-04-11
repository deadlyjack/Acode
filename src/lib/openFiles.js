import dialogs from "../components/dialogs";
import fsOperation from "./fileSystem/fsOperation";

/**
 * 
 * @param {Array<File>} files 
 */
export default async function openFiles(files) {
  for (let file of files) {
    let text = '';
    const {
      cursorPos,
      isUnsaved,
      filename,
      type,
      uri,
      id,
      readOnly,
      mode,
      deletedFile,
      folds,
      editable = true,
      encoding = 'utf-8',
    } = file;
    const render = files.length === 1 || id === localStorage.lastfile;

    try {
      const fs = fsOperation(Url.join(CACHE_STORAGE, id));
      text = await fs.readFile(encoding);
    } catch (error) { }

    Acode.setLoadingMessage(`Loading ${filename}...`);

    const options = {
      id,
      editable,
      encoding,
      render,
      folds,
      cursorPos,
      isUnsaved,
      text,
      type,
    }

    if (type === 'git') {
      gitRecord.get(file.sha).then((record) => {
        if (record) {
          editorManager.addNewFile(filename, {
            ...options,
            text: text || record.data,
            record,
          });
        }
      });
    } else if (type === 'gist') {
      const gist = gistRecord.get(file.recordid, file.isNew);
      if (gist) {
        const gistFile = gist.files[filename];
        editorManager.addNewFile(filename, {
          ...options,
          record: gist,
          text: text || gistFile.content,
        });
      }
    } else if (uri) {
      try {
        const fs = fsOperation(uri);
        if (!text) {
          text = await fs.readFile(encoding);
        } else if (!(await fs.exists()) && !readOnly) {
          uri = null;
          isUnsaved = true;
          dialogs.alert(
            strings.info.toUpperCase(),
            strings['file has been deleted'].replace('{file}', filename),
          );
        }

        if (text !== null) {
          editorManager.addNewFile(filename, {
            ...options,
            uri,
            readOnly,
            mode,
            deletedFile,
            text,
          });
        }
      } catch (error) {
        continue;
      }
    } else {
      editorManager.addNewFile(filename, options);
    }
  }
}