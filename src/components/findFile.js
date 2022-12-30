import fsOperation from '../fileSystem/fsOperation';
import openFile from '../lib/openFile';
import recents from '../lib/recents';
import helpers from '../utils/helpers';
import Url from '../utils/Url';
import pallete from './pallete';

export default async function findFile() {
  pallete(generateHints, onselect, strings['type filename']);

  /**
   * Generates hint for inputhints
   */
  async function generateHints() {
    const files = [];
    const dirs = addedFolder.map(({ url }) => url);

    editorManager.files.forEach((file) => {
      const { uri, name, type } = file;
      let { location = '' } = file;

      if (type === 'git') {
        location = 'git • ' + file.record.repo + '/' + file.record.path;
      } else if (type === 'gist') {
        const { id } = file.record;
        const path = id.length > 10 ? '...' + id.substring(id.length - 7) : id;
        location = `gist • ${path}`;
      } else if (location) {
        location = helpers.getVirtualPath(location);
      }

      files.push(hintItem(name, location, uri));
    });

    try {
      await listDir(files, dirs);
    } catch (error) {
      // ignore
    }

    return files;
  }

  /**
   * Get all file recursively
   * @param {Array} list 
   * @param {string} dir 
   */
  async function getAllFiles(list, dir, root) {
    const ls = await fsOperation(dir).lsDir();
    const dirs = [];
    ls.forEach((item) => {
      const { name, url, isDirectory } = item;

      if (isDirectory) {
        dirs.push(url);
        return;
      }

      const vRoot = helpers.getVirtualPath(root);
      const vRootDir = Url.dirname(vRoot);
      const vUrl = helpers.getVirtualPath(url);
      const path = Url.dirname(vUrl.subtract(vRootDir)).replace(/\/$/, '');
      const exists = list.findIndex(({ value }) => value === url);
      if (exists > -1) {
        list[exists] = hintItem(name, path, url);
        return;
      }
      list.push(hintItem(name, path, url));
    });

    await listDir(list, dirs, root);
  }

  /**
   * 
   * @param {Array} list 
   * @param {string[]} dirs 
   */
  async function listDir(list, dirs, root) {
    const dir = dirs.shift();
    if (!dir) return;
    await getAllFiles(list, dir, root ?? dir);
    if (dirs.length) await listDir(list, dirs, root ?? dir);
  }

  function onselect(value) {
    if (!value) return;
    openFile(value);
  }

  function hintItem(name, path, url) {
    const recent = recents.files.find((file) => file === url);
    return {
      text: `<div style="display: flex; flex-direction: column;">
        <strong ${recent ? `data-str='${strings['recently used']}'` : ''} style="font-size: 1rem;">${name}</strong>
        <span style="font-size: 0.8rem; opacity: 0.8;">${path}</span>
      <div>`,
      value: url,
    };
  }
}
