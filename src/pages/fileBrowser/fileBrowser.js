import dialogs from '../../components/dialogs';
import openFile from '../../lib/openFile';
import openFolder from '../../lib/openFolder';
import helpers from '../../utils/helpers';
import Url from '../../utils/Url';

/**
 * @typedef {"file"|"folder"|"both"} BrowseMode
 * @typedef {{type: 'file' | 'folder', url: String, name: String}} SelectedFile
 */

/**
 *
 * @param {BrowseMode} [mode='file'] Specify file browser mode, value can be 'file', 'folder' or 'both'
 * @param {string} info A small message to show what's file browser is opened for
 * @param {boolean} doesOpenLast Should file browser open lastly visited directory?
 * @param {Array<{name: String, url: String}>} defaultDir Default directory to open.
 * @returns {Promise<SelectedFile>}
 */
function FileBrowser(mode, info, doesOpenLast, ...args) {
  return new Promise((resolve, reject) => {
    import(/* webpackChunkName: "fileBrowser" */ './fileBrowser.include').then(
      (res) => {
        const FileBrowser = res.default;
        FileBrowser(mode, info, doesOpenLast, ...args)
          .then(resolve)
          .catch(reject);
      },
    );
  });
}

FileBrowser.openFile = (res) => {
  const { url, name, mode } = res;
  const createOption = {
    uri: url,
    name,
    render: true,
  };

  if (mode) {
    createOption.mode = mode;
  }

  openFile(url, createOption);
};

FileBrowser.openFileError = (err) => {
  console.error(err);
  const ERROR = strings.error.toUpperCase();
  const message = `${strings['unable to open file']}. ${helpers.errorMessage(err.code)}`;
  if (err.code) {
    dialogs.alert(ERROR, message);
  } else if (err.code !== 0) {
    dialogs.alert(ERROR, strings['unable to open file']);
  }
};

FileBrowser.openFolder = (res) => {
  const url = res.url;
  const protocol = Url.getProtocol(url);

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
  console.error(err);
  const ERROR = strings.error.toUpperCase();
  const message = `${strings['unable to open folder']}. ${helpers.errorMessage(err.code)}`;
  if (err.code) {
    dialogs.alert(ERROR, message);
  } else if (err.code !== 0) {
    dialogs.alert(ERROR, strings['unable to open folder']);
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
