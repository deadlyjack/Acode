import URLParse from 'url-parse';
import escapeStringRegexp from 'escape-string-regexp';
import fsOperation from '../fileSystem';
import collapsableList from '../components/collapsableList';
import helpers from '../utils/helpers';
import dialogs from '../components/dialogs';
import tile from '../components/tile';
import constants from './constants';
import recents from './recents';
import Path from '../utils/Path';
import openFile from './openFile';
import Url from '../utils/Url';
import FileBrowser from '../pages/fileBrowser';
import appSettings from './settings';
import sidebarApps from '../sidebarApps';
import Sidebar from '../components/sidebar';

/**
 *
 * @param {string} _path
 * @param {object} [opts]
 * @param {string} [opts.name]
 * @param {string} [opts.id]
 * @param {boolean} [opts.saveState]
 * @param {Map<string, boolean>} [opts.listState]
 */
function openFolder(_path, opts = {}) {
  if (addedFolder.find((folder) => folder.url === _path)) {
    return;
  }

  /**
   * @type {{url: string, $el: HTMLElement, action: "cut"|"copy"}}
   */
  let clipBoard = null;
  let saveState = true;

  if ('saveState' in opts) saveState = opts.saveState;

  const listState = opts.listState || {};
  const title = opts.name || getTitle();
  const $root = collapsableList(title, !listState[_path], 'folder', {
    tail: <Tail target={() => $root.$title} />,
    allCaps: true,
    ontoggle: expandList,
  });
  const $text = $root.$title.querySelector(':scope>span.text');
  const startLoading = () => $root?.$title?.classList.add('loading');
  const stopLoading = () => $root?.$title?.classList.remove('loading');
  const folder = {
    title,
    remove,
    saveState,
    listState,
    url: _path,
    $node: $root,
    id: opts.id,
    reload() {
      $root.collapse();
      $root.uncollapse();
    },
  };

  $root.id = 'r' + _path.hashCode();
  $text.style.overflow = 'hidden';
  $text.style.whiteSpace = 'nowrap';
  $text.style.textOverflow = 'ellipsis';
  $root.$title.data_type = 'root';
  $root.$title.data_url = _path;
  $root.$title.data_name = title;

  $root.$ul.onclick =
    $root.$ul.oncontextmenu =
    $root.$title.onclick =
    $root.$title.oncontextmenu =
    handleItems;

  addedFolder.push(folder);
  recents.addFolder(_path, opts);
  sidebarApps.get('files').append($root);
  editorManager.onupdate('add-folder', _path);
  editorManager.emit('update', 'add-folder');

  /**
   *
   * @param {"file"|"dir"|"root"} type
   * @param {string} url
   * @param {string} name
   * @param {HTMLElement} $target
   */
  async function handleContextmenu(type, url, name, $target) {
    if (appSettings.value.vibrateOnTap) {
      navigator.vibrate(constants.VIBRATION_TIME);
    }
    const cancel = `${strings.cancel}${clipBoard ? ` (${strings[clipBoard.action]})` : ''}`;
    const COPY = ['copy', strings.copy, 'copy'];
    const CUT = ['cut', strings.cut, 'cut'];
    const REMOVE = ['delete', strings.delete, 'delete'];
    const RENAME = ['rename', strings.rename, 'edit'];
    const PASTE = ['paste', strings.paste, 'paste', !!clipBoard];
    const NEW_FILE = ['new file', strings['new file'], 'document-add'];
    const NEW_FOLDER = ['new folder', strings['new folder'], 'folder-add'];
    const CANCEL = ['cancel', cancel, 'clearclose'];
    const OPEN_FOLDER = ['open-folder', strings['open folder'], 'folder'];
    const INSERT_FILE = ['insert-file', strings['insert file'], 'file_copy'];
    const CLOSE_FOLDER = ['close', strings['close'], 'folder-remove'];

    let options;

    if (helpers.isFile(type)) {
      options = [
        COPY,
        CUT,
        RENAME,
        REMOVE,
      ];
    } else if (helpers.isDir(type)) {
      options = [
        COPY,
        CUT,
        REMOVE,
        RENAME,
        PASTE,
        NEW_FILE,
        NEW_FOLDER,
        OPEN_FOLDER,
        INSERT_FILE,
      ];
    } else if (type === 'root') {
      options = [
        PASTE,
        NEW_FILE,
        NEW_FOLDER,
        INSERT_FILE,
        CLOSE_FOLDER,
      ];
    }

    if (clipBoard) options.push(CANCEL);

    try {
      const option = await dialogs.select(name, options);
      await execOperation(type, option, url, $target, name)
    } catch (error) {
      console.error(error);
      helpers.error(error);
    } finally {
      stopLoading();
    }
  }

  /**
   * Expand the list
   * @this {import('../components/collapsableList').Collaspable}
   */
  async function expandList() {
    const { $ul, $title } = this;
    const { data_url: url } = $title;

    if (!$ul) return;

    $ul.textContent = null;

    if (saveState) listState[url] = this.uncollapsed;
    if (this.uncollapsed) {
      try {
        startLoading();
        const entries = await fsOperation(url).lsDir();
        helpers.sortDir(entries, {
          sortByName: true,
          showHiddenFiles: true,
        }).map((entry) => {
          const name = entry.name || Path.basename(entry.url);
          if (entry.isDirectory) {
            const $list = createFolderTile(name, entry.url);
            $ul.appendChild($list);
          } else {
            const $item = createFileTile(name, entry.url);
            $ul.append($item);
          }
        });
      } catch (err) {
        this.collapse();
        helpers.error(err);
      } finally {
        stopLoading();
      }
    }
  }

  function getTitle() {
    let title = '';
    try {
      const { username, hostname, port } = URLParse(_path);
      if (username && hostname) title = `${username}@${hostname}`;
      else if (hostname) title = hostname;

      if (hostname && port) title += ':' + port;

      if (title) return title;
      else return Path.basename(_path);
    } catch (error) {
      return Path.basename(_path);
    }
  }

  function remove(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    if ($root.parentElement) {
      $root.remove();
    }

    addedFolder = addedFolder.filter((folder) => folder.url !== _path);
    editorManager.onupdate('remove-folder', _path);
    editorManager.emit('update', 'remove-folder');
  }

  /**
   *
   * @param {Event} e
   */
  function handleItems(e) {
    const mode = e.type;
    const $target = e.target;
    if (!($target instanceof HTMLElement)) return;
    const type = $target.data_type;
    if (!type) return;
    const url = $target.data_url;
    const name = $target.data_name;

    if (mode === 'click') {
      handleClick(type, url, name, $target);
    } else if (mode === 'contextmenu') {
      handleContextmenu(type, url, name, $target);
    }
  }

  /**
   *
   * @param {"file"|"dir"|"root"} type
   * @param {string} url
   */
  function handleClick(type, uri) {
    if (helpers.isFile(type)) {
      openFile(uri, { render: true });
      Sidebar.hide();
    }
  }

  /**
   * @param {"dir"|"file"|"root"} type
   * @param {"copy"|"cut"|"delete"|"rename"|"paste"|"new file"|"new folder"|"cancel"|"open-folder"} action
   * @param {string} url target url
   * @param {HTMLElement} $target target element
   * @param {string} name Name of file or folder
   */
  function execOperation(type, action, url, $target, name) {
    if (helpers.isDir(type)) {
      Url.join(url, '/');
    }

    switch (action) {
      case 'copy':
      case 'cut':
        return clipBoardAction();

      case 'delete':
        return deleteFile();

      case 'rename':
        return renameFile();

      case 'paste':
        return paste();

      case 'new file':
      case 'new folder':
        return createNew();

      case 'cancel':
        return cancel();

      case 'open-folder':
        return open();

      case 'insert-file':
        return insertFile();

      case 'close':
        return remove();
    }

    async function deleteFile() {
      const msg = strings['delete {name}'].replace('{name}', name);
      const confirmation = await dialogs.confirm(strings.warging, msg);
      if (!confirmation) return;
      startLoading();
      await fsOperation(url).delete();
      recents.removeFile(url);
      if (helpers.isFile(type)) {
        $target.remove();
        const file = editorManager.getFile(url, 'uri');
        if (file) file.uri = null;
        editorManager.onupdate('delete-file');
        editorManager.emit('update', 'delete-file');
      } else {
        recents.removeFolder(url);
        helpers.updateUriOfAllActiveFiles(url, null);
        $target.parentElement.remove();
        editorManager.onupdate('delete-folder');
        editorManager.emit('update', 'delete-folder');
      }
      toast(strings.success);
    }

    async function renameFile() {
      let newName = await dialogs.prompt(strings.rename, name, 'text', {
        match: constants.FILE_NAME_REGEX,
        required: true,
      });
      newName = helpers.fixFilename(newName);
      if (newName === name) return;

      startLoading();
      const fs = fsOperation(url);
      const newUrl = await fs.renameTo(newName);
      newName = Url.basename(newUrl);
      $target.querySelector(':scope>.text').textContent = newName;
      $target.data_url = newUrl;
      $target.data_name = newName;
      if (helpers.isFile(type)) {
        $target.querySelector(':scope>span').className =
          helpers.getIconForFile(newName);
        let file = editorManager.getFile(url, 'uri');
        if (file) {
          file.uri = newUrl;
          file.filename = newName;
        }
      } else {
        helpers.updateUriOfAllActiveFiles(url, newUrl);
        //Reloading the folder by collasping and expanding the folder
        $target.click(); //collaspe
        $target.click(); //expand
      }
      toast(strings.success);
    }

    async function createNew() {
      const msg = action === 'new file'
        ? strings['enter file name']
        : strings['enter folder name'];

      const defaultValue = action === 'new file'
        ? constants.DEFAULT_FILE_NAME
        : strings['new folder'];

      let newName = await dialogs.prompt(msg, defaultValue, 'text', {
        match: constants.FILE_NAME_REGEX,
        required: true,
      });

      newName = newName.trim();
      startLoading();
      const fs = fsOperation(url);
      let newUrl;

      if (action === 'new file') {
        newUrl = await fs.createFile(newName);
      } else {
        newUrl = await fs.createDirectory(newName);
      }

      newName = Url.basename(newUrl);
      if ($target.uncollapsed) {
        if (action === 'new file') {
          appendTile($target, createFileTile(newName, newUrl));
        } else {
          appendList($target, createFolderTile(newName, newUrl));
        }
      }
      toast(strings.success);
    }

    async function paste() {
      let CASE = '';
      const $src = clipBoard.$el;
      const srcType = $src.data_type;
      const IS_FILE = helpers.isFile(srcType);
      const IS_DIR = helpers.isDir(srcType);
      const srcCollapsed = collapsed($src, IS_FILE);

      CASE += IS_FILE ? 1 : 0;
      CASE += srcCollapsed ? 1 : 0;
      CASE += $target.collapsed ? 1 : 0;

      const fs = fsOperation(clipBoard.url);
      let newUrl;
      if (clipBoard.action === 'cut') newUrl = await fs.moveTo(url);
      else newUrl = await fs.copyTo(url);
      const { name: newName } = await fsOperation(newUrl).stat();
      /**
       * CASES:
       * CASE 111: src is file and parent is collapsed where target is also collapsed
       * CASE 110: src is file and parent is collapsed where target is uncollapsed
       * CASE 101: src is file and parent is uncollapsed where target is collapsed
       * CASE 100: src is file and parent is uncollapsed where target is also uncollapsed
       * CASE 011: src is directory and parent is collapsed where target is also collapsed
       * CASE 001: src is directory and parent is uncollapsed where target is also collapsed
       * CASE 010: src is directory and parent is collapsed where target is also uncollapsed
       * CASE 000: src is directory and parent is uncollapsed where target is also uncollapsed
       */

      if (clipBoard.action === 'cut') {
        //move

        if (IS_FILE) {
          const file = editorManager.getFile(clipBoard.url, 'uri');
          if (file) file.uri = newUrl;
        } else if (IS_DIR) {
          helpers.updateUriOfAllActiveFiles(clipBoard.url, newUrl);
        }

        switch (CASE) {
          case '111':
          case '011':
            break;

          case '110':
            appendTile($target, createFileTile(newName, newUrl));
            break;

          case '101':
            $src.remove();
            break;

          case '100':
            appendTile($target, createFileTile(newName, newUrl));
            $src.remove();
            break;

          case '001':
            $src.parentElement.remove();
            break;

          case '010':
            appendList($target, createFolderTile(newName, newUrl));
            break;

          case '000':
            appendList($target, createFolderTile(newName, newUrl));
            $src.parentElement.remove();
            break;

          default:
            break;
        }
      } else {
        //copy

        switch (CASE) {
          case '111':
          case '101':
          case '011':
          case '001':
            break;

          case '110':
          case '100':
            appendTile($target, createFileTile(newName, newUrl));
            break;

          case '010':
          case '000':
            appendList($target, createFolderTile(newName, newUrl));
            break;

          default:
            break;
        }
      }

      toast(strings.success);
      clipBoard = null;
    }

    async function insertFile() {
      startLoading();
      try {
        const file = await FileBrowser('file', strings['insert file']);
        const srcfs = fsOperation(file.url);
        const data = await srcfs.readFile();
        const stats = await srcfs.stat();

        const name = stats.name;
        const fileUrl = Url.join(url, name);

        const destfs = fsOperation(url);
        await destfs.createFile(name, data);
        appendTile($target, createFileTile(name, fileUrl));
      } catch (error) { } finally {
        stopLoading();
      }
    }

    async function clipBoardAction() {
      clipBoard = {
        url,
        action,
        $el: $target,
      };

      if (action === 'cut') $target.classList.add('cut');
      else $target.classList.remove('cut');
    }

    async function open() {
      FileBrowser.openFolder({
        url,
        name,
      });
    }

    async function cancel() {
      clipBoard.$el.classList.remove('cut');
      clipBoard = null;
    }

    /**
     *
     * @param {HTMLElement} $target
     * @param {HTMLElement} $src
     */
    function appendTile($target, $src) {
      $target = $target.nextElementSibling;
      const $firstTile = $target.querySelector(':scope>[type=file]');
      if ($firstTile) $target.insertBefore($src, $firstTile);
      else $target.append($src);
    }

    /**
     *
     * @param {HTMLElement} $target
     * @param {HTMLElement} $src
     */
    function appendList($target, $src) {
      $target = $target.nextElementSibling;
      const $firstList = $target.firstElementChild;
      if ($firstList) $target.insertBefore($src, $firstList);
      else $target.append($src);
    }
  }

  function collapsed($el, IS_FILE) {
    if (!$el.isConnected) return true;
    $el = $el.parentElement;
    if (!IS_FILE) {
      $el = $el.parentElement;
    }

    return $el.previousElementSibling.collapsed;
  }

  function createFileTile(name, url) {
    const $tile = tile({
      lead: <span className={helpers.getIconForFile(name)}></span>,
      text: name,
      tail: <Tail target={() => $tile} />,
    });
    $tile.data_url = url;
    $tile.data_name = name;
    $tile.data_type = 'file';

    return $tile;
  }

  function createFolderTile(name, url) {
    const $list = collapsableList(name, !listState[url], 'folder', {
      tail: <Tail target={() => $list.$title} />,
      ontoggle: expandList,
    });
    $list.$title.data_url = url;
    $list.$title.data_type = 'dir';
    $list.$title.data_name = name;

    return $list;
  }

  function Tail({ target }) {
    return <span
      className='icon more_vert'
      attr-action='close'
      onclick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleItems({
          target: target(),
          type: 'contextmenu',
        });
      }}
    ></span>
  }
}

openFolder.updateItem = function (oldFile, newFile, newFilename) {
  const $el = Sidebar.el.get(`[url="${oldFile}"]`);
  if ($el) {
    $el.data_url = newFile;
    $el.data_name = newFilename;
    $el.querySelector(':scope>span').className =
      helpers.getIconForFile(newFilename);
    $el.querySelector(':scope>.text').textContent = newFilename;
  }
};

openFolder.removeItem = function (url) {
  const $el = Sidebar.el.querySelector(`[url="${url}"]`);
  if ($el) {
    const type = $el.data_type;
    if (helpers.isFile(type)) {
      $el.remove();
    } else {
      $el.parentElement.remove();
    }
  }
};

openFolder.removeFolders = function (url) {
  ({ url } = Url.parse(url));
  const regex = new RegExp('^' + escapeStringRegexp(url));
  addedFolder.forEach((folder) => {
    if (regex.test(folder.url)) {
      folder.remove();
    }
  });
};

/**
 *
 * @param {String} url
 * @returns {Folder}
 */
openFolder.find = function (url) {
  return addedFolder.find((folder) => {
    const { url: furl } = Url.parse(folder.url);
    const regex = new RegExp('^' + escapeStringRegexp(furl));
    return regex.test(url);
  });
};

export default openFolder;
