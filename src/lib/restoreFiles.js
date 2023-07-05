import EditorFile from './editorFile';

/**
 * 
 * @param {import('./editorFile').FileOptions[]} files 
 * @param {(count: number)=>void} callback
 */
export default async function restoreFiles(files) {
  const promises = [];
  let rendered = false;

  recursiveOpenFile(files);

  /**
   * 
   * @param {Array} files 
   */
  async function recursiveOpenFile(files) {
    const file = files.shift();
    if (!file) return;

    await openFile(file);
    if (files.length) {
      if (files.length === 1 && !rendered) {
        files[0].render = true;
      }
      recursiveOpenFile(files);
    }
  }

  async function openFile(file) {
    const { filename, render = false } = file;

    const options = {
      ...file,
      render,
      emitUpdate: false,
    };

    if (!rendered) rendered = render;

    new EditorFile(filename, options);
  }

  const res = await Promise.allSettled(promises);
  const failed = res.filter(r => r.status === 'rejected');
  const success = res.filter(r => r.status === 'fulfilled');
  return {
    failed,
    success,
  };
}