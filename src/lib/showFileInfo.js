import fileSize from 'filesize';
import mustache from 'mustache';
import $_fileInfo from '../views/file-info.hbs';
import fsOperation from './fileSystem/fsOperation';
import Url from './utils/Url';
import dialogs from '../components/dialogs';
import helpers from './utils/helpers';

/**
 * Shows file info
 * @param {String} [url]
 */
export default async function showFileInfo(url) {
  if (!url) url = editorManager.activeFile.uri;
  app.classList.add('title-loading');
  try {
    const fs = fsOperation(url);
    const stats = await fs.stats();
    const value = await fs.readFile('utf-8');

    let { name, lastModified, length, uri, type } = stats;
    length = fileSize(length);
    lastModified = new Date(lastModified).toLocaleString();

    const protocol = Url.getProtocol(uri);
    const options = {
      name,
      lastModified,
      length,
      showUri: uri,
      shareUri: uri,
      type,
      lineCount: value.split(/\n+/).length,
      wordCount: value.split(/\s+|\n+/).length,
      lang: strings,
      showUri: helpers.getVirtualPath(url),
    };

    if (/s?ftp:/.test(protocol)) {
      options.shareUri = Url.join(CACHE_STORAGE, name);
      const fs = fsOperation(options.shareUri);
      if (await fs.exists()) {
        await fs.deleteFile();
      }
      await fsOperation(CACHE_STORAGE).createFile(name, value);
    }

    dialogs.box('', mustache.render($_fileInfo, options), true).onclick((e) => {
      const $target = e.target;
      if ($target instanceof HTMLElement) {
        const action = $target.getAttribute('action');
        const value = $target.getAttribute('value');

        if (action === 'share') {
          system.shareFile(value, () => {}, console.error);
        }
      }
    });
  } catch (err) {
    helpers.error(err);
  }

  app.classList.remove('title-loading');
}
