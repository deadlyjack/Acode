/**
 * 
 * @param {Array<File>} files 
 * @param {(count: number)=>void} callback
 */
export default async function openFiles(files) {
  const promises = [];

  files.forEach((file) => {
    promises.push((async () => {
      const { id, type, filename } = file;
      const render = files.length === 1 || id === localStorage.lastfile;
      let options = { ...file, emitUpdate: false, render };
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
      }

      editorManager.addNewFile(filename, options);
    })(file));
  });

  const res = await Promise.allSettled(promises);
  const failed = res.filter(r => r.status === 'rejected');
  const success = res.filter(r => r.status === 'fulfilled');
  return {
    failed,
    success,
  }
}