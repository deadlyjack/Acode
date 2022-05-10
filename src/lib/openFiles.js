import fsOperation from "./fileSystem/fsOperation";
import Url from "./utils/Url";

/**
 * 
 * @param {Array<File>} files 
 * @param {(count: number)=>void} callback
 */
export default async function openFiles(files, callback) {
  const promises = [];
  let count = 0;
  for (let file of files) {
    promises.push((async () => {
      const {
        id,
        uri,
        type,
        readOnly,
        filename,
        encoding = 'utf-8',
      } = file;
      const render = files.length === 1 || id === localStorage.lastfile;
      let options = {
        ...file,
        emitUpdate: false,
        render,
      };

      try {
        const fs = fsOperation(Url.join(CACHE_STORAGE, id));
        options.text = await fs.readFile(encoding);
      } catch (error) { }

      if (type === 'git') {
        const record = await gitRecord.get(file.sha);
        if (record) {
          if (!options.text) options.text = record.data;
          options.record = record;
        }
      } else if (type === 'gist') {
        const gist = gistRecord.get(file.recordid, file.isNew);
        if (gist) {
          const gistFile = gist.files[filename];
          if (!options.text) options.text = gistFile.content;
          options.record = gist;
        }
      } else if (uri) {
        const fs = fsOperation(uri);
        const exsits = await fs.exists();
        if (!options.text && exsits) {
          options.text = await fs.readFile(encoding);
        } else if (!readOnly && !exsits) {
          options.isUnsaved = true;
          options.deletedFile = true;
        }
      }

      if (typeof callback === 'function') callback(++count);
      editorManager.addNewFile(filename, options);
    })(file));
  }

  const res = await Promise.allSettled(promises);
  const failed = res.filter(r => r.status === 'rejected');
  const success = res.filter(r => r.status === 'fulfilled');
  return {
    failed,
    success,
  }
}