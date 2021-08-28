import openFile from '../../lib/openFile';
import openFolder from '../../lib/openFolder';
import helpers from '../../lib/utils/helpers';
import Url from '../../lib/utils/Url';

/**
 * @typedef {"file"|"folder"|"both"} BrowseMode
 * @typedef {{type: 'file' | 'folder', url: String, name: String}} SelectedFile
 */

/**
 *
 * @param {BrowseMode} [mode='file'] Specify file browser mode, value can be 'file', 'folder' or 'both'
 * @param {string} info A small message to show what's file browser is opened for
 * @param {string} buttonText button text
 * @param {boolean} doesOpenLast Should file browser open lastly visited directory?
 * @param {Array<{name: String, url: String}>} defaultDir Default directory to open.
 * @returns {Promise<SelectedFile>}
 */
function FileBrowser(
  mode,
  info,
  buttonText,
  doesOpenLast,
  defaultDir,
  ...args
) {
  return new Promise((resolve, reject) => {
    import(/* webpackChunkName: "fileBrowser" */ './fileBrowser.include').then(
      (res) => {
        const FileBrowser = res.default;
        FileBrowser(mode, info, buttonText, doesOpenLast, defaultDir, ...args)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

FileBrowser.checkForValidFile = (uri) => {
  const ext = helpers.extname(uri);

  if (
    appSettings.defaultSettings.filesNotAllowed.includes(
      (ext || '').toLowerCase()
    )
  ) {
    return false;
  }
  return true;
};

FileBrowser.openFile = (res) => {
  const { url, name } = res;

  const createOption = {
    uri: url,
    name: name,
    render: true,
  };
  openFile(url, createOption);
};

FileBrowser.openFileError = (err) => {
  const ERROR = strings.error.toUpperCase();
  if (err.code) {
    alert(
      ERROR,
      `${strings['unable to open file']}. ${helpers.getErrorMessage(err.code)}`
    );
  } else if (err.code !== 0) {
    alert(ERROR, strings['unable to open file']);
  }
};

FileBrowser.openFolder = (res) => {
  const url = res.url;
  const protocol = Url.getProtocol(url);

  async () => {};

  if (protocol === 'ftp:') {
    openFolder(res.url, {
      name: res.name,
      reloadOnResume: false,
      saveState: false,
    });
    return;
  }

  openFolder(res.url, {
    name: res.name,
  });
};

FileBrowser.openFolderError = (err) => {
  if (err.code) {
    alert(
      strings.error.toUpperCase(),
      `${strings['unable to open folder']}. ${helpers.getErrorMessage(
        err.code
      )}`
    );
  } else if (err.code !== 0) {
    alert(strings.error.toUpperCase(), strings['unable to open folder']);
  }
};

FileBrowser.open = (res) => {
  if (res.type === 'folder') {
    FileBrowser.openFolder(res);
    return;
  }

  FileBrowser.openFile(res);
};

FileBrowser.openError = (err) => {
  FileBrowser.openFileError(err);
};

export default FileBrowser;
