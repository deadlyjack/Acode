import { filesize } from 'filesize';
import mustache from 'mustache';
import $_fileInfo from 'views/file-info.hbs';
import fsOperation from 'fileSystem';
import Url from 'utils/Url';
import helpers from 'utils/helpers';
import settings from './settings';
import box from 'dialogs/box';

/**
 * Shows file info
 * @param {String} [url]
 */
export default async function showFileInfo(url) {
  if (!url) url = editorManager.activeFile.uri;
  app.classList.add('title-loading');
  try {
    const fs = fsOperation(url);
    const stats = await fs.stat();
    const value = await fs.readFile(settings.value.defaultFileEncoding);

    let { name, lastModified, length, uri, type } = stats;
    length = filesize(length);
    lastModified = new Date(lastModified).toLocaleString();

    const protocol = Url.getProtocol(uri);
    const options = {
      name,
      lastModified,
      length,
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
        await fs.delete();
      }
      await fsOperation(CACHE_STORAGE).createFile(name, value);
    }

    box('', mustache.render($_fileInfo, options), true).onclick((e) => {
      const $target = e.target;
      if ($target instanceof HTMLElement) {
        const action = $target.getAttribute('action');

        if (action === 'copy') {
          cordova.plugins.clipboard.copy($target.textContent);
          toast(strings['copied to clipboard']);
        }
      }
    });
  } catch (err) {
    helpers.error(err);
  }

  app.classList.remove('title-loading');
}
