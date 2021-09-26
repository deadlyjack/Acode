import tag from 'html-tag-js';
import fsOperation from './fileSystem/fsOperation';
import collapsableList from '../components/collapsableList';
import helpers from './utils/helpers';
import dialogs from '../components/dialogs';
import tile from '../components/tile';
import constants from './constants';
import recents from './recents';
import Path from './utils/Path';
import openFile from './openFile';
import Url from './utils/Url';
import FileBrowser from '../pages/fileBrowser/fileBrowser';
import URLParse from 'url-parse';

/**
 *
 * @param {string} _path
 * @param {object} [opts]
 * @param {string} [opts.name]
 * @param {string} [opts.id]
 * @param {boolean} [opts.saveState=true]
 * @param {boolean} [opts.reloadOnResume=true]
 */
function openFolder(_path, opts = {}) {
  if (addedFolder.find((folder) => folder.url === _path)) {
    return;
  }

  let saveState = true,
    reloadOnResume = true;

  if ('saveState' in opts) saveState = opts.saveState;
  if ('reloadOnResume' in opts) reloadOnResume = opts.reloadOnResume;

  const listState = {};
  const title = opts.name || getTitle();
  const $closeBtn = tag('span', {
    className: 'icon cancel',
    attr: {
      action: 'close',
    },
    onclick: remove,
  });
  let $root = collapsableList(title, !!!listState[_path], 'folder', {
    tail: $closeBtn,
    allCaps: true,
    ontoggle: function (state) {
      if (state === 'uncollapsed') {
        for (let folder of addedFolder) {
          if (folder.url !== _path) folder.$node.collapse();
        }
      }
      expandList.call(this);
    },
  });
  /**
   * @type {{url: string, $el: HTMLElement, action: "cut"|"copy"}}
   */
  let clipBoard = null;
  const loading = {
    start() {
      $root.$title.classList.add('loading');
    },
    stop() {
      $root.$title.classList.remove('loading');
    },
  };
  const $text = $root.$title.querySelector(':scope>span.text');

  $root.id = 'r' + _path.hashCode();

  if ($text) {
    $text.style.overflow = 'hidden';
    $text.style.whiteSpace = 'nowrap';
    $text.style.textOverflow = 'ellipsis';
  }
  $root.$title.data_type = 'root';
  $root.$title.data_url = _path;
  $root.$title.data_name = title;

  $root.$ul.onclick =
    $root.$ul.oncontextmenu =
    $root.$title.onclick =
    $root.$title.oncontextmenu =
      handleItems;

  addedFolder.push({
    url: _path,
    remove,
    $node: $root,
    reload: () => {
      if (!reloadOnResume) return;
      $root.collapse();
      $root.uncollapse();
    },
    reloadOnResume,
    saveState,
    title,
    id: opts.id,
  });

  updateHeight();
  recents.addFolder(_path, opts);
  editorManager.sidebar.appendChild($root);
  editorManager.onupdate('add-folder', _path);

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
      $root = null;
    }

    addedFolder = addedFolder.filter((folder) => folder.url !== _path);
    updateHeight();
    editorManager.onupdate('remove-folder', _path);
  }

  function updateHeight() {
    openFolder.updateHeight();
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

    if (mode === 'click') handleClick(type, url, name, $target);
    else if (mode === 'contextmenu')
      handleContextmenu(type, url, name, $target);
  }

  /**
   *
   * @param {"file"|"dir"|"root"} type
   * @param {string} url
   */
  function handleClick(type, uri) {
    if (helpers.isFile(type)) {
      openFile(uri, { render: true });
      editorManager.sidebar.hide();
    }
  }

  /**
   *
   * @param {"file"|"dir"|"root"} type
   * @param {string} url
   * @param {string} name
   * @param {HTMLElement} $target
   */
  function handleContextmenu(type, url, name, $target) {
    if (appSettings.value.vibrateOnTap)
      navigator.vibrate(constants.VIBRATION_TIME);
    const cancel =
      strings.cancel +
      (clipBoard ? ' (' + strings[clipBoard.action] + ')' : '');
    const COPY = ['copy', strings.copy, 'copy'],
      CUT = ['cut', strings.cut, 'cut'],
      REMOVE = ['delete', strings.delete, 'delete'],
      RENAME = ['rename', strings.rename, 'edit'],
      PASTE = ['paste', strings.paste, 'paste', !!clipBoard],
      NEW_FILE = ['new file', strings['new file'], 'document-add'],
      NEW_FOLDER = ['new folder', strings['new folder'], 'folder-add'],
      CANCEL = ['cancel', cancel, 'clearclose'],
      OPEN_FOLDER = ['open-folder', strings['open folder'], 'folder'],
      INSERT_FILE = ['insert-file', strings['insert file'], 'file_copy'];

    let options;

    if (helpers.isFile(type)) options = [COPY, CUT, RENAME, REMOVE];
    else if (helpers.isDir(type))
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
    else if (type === 'root')
      options = [RENAME, PASTE, NEW_FILE, NEW_FOLDER, INSERT_FILE];

    if (clipBoard) options.push(CANCEL);

    dialogs.select(name, options).then((res) => {
      execOperation(type, res, url, $target, name)
        .catch((err) => {
          if (err === false) return;

          console.error(err);
          helpers.error(err);
        })
        .finally(loading.stop);
    });
  }

  /**
   * @param {"dir"|"file"|"root"} type
   * @param {"copy"|"cut"|"delete"|"rename"|"paste"|"new file"|"new folder"|"cancel"|"open-folder"} action
   * @param {string} url target url
   * @param {HTMLElement} $target target element
   * @param {string} name Name of file or folder
   */
  function execOperation(type, action, url, $target, name) {
    let newName,
      CASE = '',
      src,
      srcName,
      srcType,
      $src,
      msg,
      defaultValue;

    if (helpers.isDir(type)) {
      Url.join(url, '/');
    }

    const target = $target.getAttribute('state');

    switch (action) {
      case 'copy':
      case 'cut':
        clipBoard = {
          url,
          action,
          $el: $target,
        };
        if (action === 'cut') $target.classList.add('cut');
        else $target.classList.remove('cut');
        return Promise.resolve();

      case 'delete':
        msg = strings['delete {name}'].replace('{name}', name);

        return dialogs
          .confirm(strings.warging, msg)
          .then(() => {
            loading.start();
            const fs = fsOperation(url);
            if (helpers.isDir(type)) return fs.deleteDir();
            else if (helpers.isFile(type)) return fs.deleteFile();
          })
          .then(() => {
            recents.removeFile(url);
            if (helpers.isFile(type)) {
              $target.remove();
              const file = editorManager.getFile(url, 'uri');
              if (file) file.uri = null;
              editorManager.onupdate('delete-file');
            } else {
              recents.removeFolder(url);
              helpers.updateUriOfAllActiveFiles(url, null);
              $target.parentElement.remove();
              editorManager.onupdate('delete-folder');
            }
            toast(strings.success);
          });

      case 'rename':
        return dialogs
          .prompt(strings.rename, name, 'text', {
            match: constants.FILE_NAME_REGEX,
            required: true,
          })
          .then(async (newname) => {
            loading.start();
            newName = newname;
            if (newName !== name) {
              const fs = fsOperation(url);
              const newUrl = await fs.renameTo(newName);
              newName = Url.basename(newUrl);
              $target.querySelector(':scope>.text').textContent = newName;
              $target.data_url = newUrl;
              $target.data_urlname = newName;
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
          });

      case 'paste':
        $src = clipBoard.$el;
        srcType = $src.data_type;
        src = $src.isConnected
          ? (helpers.isFile(srcType)
              ? $src.parentElement
              : $src.parentElement.parentElement
            ).previousElementSibling.getAttribute('state')
          : 'uncollapsed';
        srcName = $src.data_name;

        CASE += helpers.isFile(srcType) ? 1 : 0;
        CASE += src === 'collapsed' ? 1 : 0;
        CASE += target === 'collapsed' ? 1 : 0;

        return (async () => {
          const fs = fsOperation(clipBoard.url);
          let newUrl;
          if (clipBoard.action === 'cut') newUrl = await fs.moveTo(url);
          else newUrl = await fs.copyTo(url);
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

            if (helpers.isFile(srcType)) {
              const file = editorManager.getFile(clipBoard.url, 'uri');
              file.uri = newUrl;
            } else if (helpers.isDir(srcType)) {
              helpers.updateUriOfAllActiveFiles(clipBoard.url, newUrl);
            }

            switch (CASE) {
              case '111':
              case '011':
                break;

              case '110':
                appendTile($target, createFileTile(srcName, newUrl));
                break;

              case '101':
                $src.remove();
                break;

              case '100':
                appendTile($target, createFileTile(srcName, newUrl));
                $src.remove();
                break;

              case '001':
                $src.parentElement.remove();
                break;

              case '010':
                appendList($target, createFolderTile(srcName, newUrl));
                break;

              case '000':
                appendList($target, createFolderTile(srcName, newUrl));
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
                appendTile($target, createFileTile(srcName, newUrl));
                break;

              case '010':
              case '000':
                appendList($target, createFolderTile(srcName, newUrl));
                break;

              default:
                break;
            }
          }

          toast(strings.success);
          clipBoard = null;
        })();

      case 'new file':
      case 'new folder':
        msg =
          action === 'new file'
            ? strings['enter file name']
            : strings['enter folder name'];
        defaultValue =
          action === 'new file'
            ? constants.DEFAULT_FILE_NAME
            : strings['new folder'];
        return dialogs
          .prompt(msg, defaultValue, 'text', {
            match: constants.FILE_NAME_REGEX,
            required: true,
          })
          .then((res) => {
            loading.start();
            newName = res;
            const fs = fsOperation(url);
            if (action === 'new file') return fs.createFile(newName);
            else return fs.createDirectory(newName);
          })
          .then((newUrl) => {
            newName = Url.basename(newUrl);
            if (target === 'uncollapsed') {
              if (action === 'new file')
                appendTile($target, createFileTile(newName, newUrl));
              else appendList($target, createFolderTile(newName, newUrl));
            }
            toast(strings.success);
          });

      case 'cancel':
        clipBoard.$el.classList.remove('cut');
        clipBoard = null;
        return Promise.resolve();

      case 'open-folder':
        const obj = JSON.parse(JSON.stringify(opts));
        obj.name = name;
        openFolder(url, obj);
        return Promise.resolve();

      case 'insert-file':
        return (async () => {
          loading.start();
          const file = await FileBrowser('file', strings['insert file']);
          let fs = fsOperation(file.url);
          let data = await fs.readFile();
          const stats = await fs.stats();

          if (stats.length > 50000000)
            throw new Error('Unable to insert file large than 50MB.');

          const name = stats.name;
          const fileUrl = Url.join(url, name);

          fs = fsOperation(url);

          try {
            await fs.createFile(name);
          } catch (error) {}

          fs = fsOperation(fileUrl);
          await fs.writeFile(data);
          appendTile($target, createFileTile(name, fileUrl));
        })();
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

  function createFileTile(name, url) {
    const $tile = tile({
      lead: tag('span', {
        className: helpers.getIconForFile(name),
      }),
      text: name,
    });
    $tile.data_url = url;
    $tile.data_name = name;
    $tile.data_type = 'file';

    return $tile;
  }

  function createFolderTile(name, url) {
    const $list = collapsableList(name, !!!listState[url], 'folder', {
      ontoggle: expandList,
    });
    $list.$title.data_url = url;
    $list.$title.data_type = 'dir';
    $list.$title.data_name = name;

    return $list;
  }

  /**
   *
   * @this {import('../components/collapsableList').Collaspable}
   */
  async function expandList() {
    const $target = this.$title;
    const $ul = this.$ul;
    const url = $target.data_url;
    const state = $target.getAttribute('state');

    if (!$ul) return;
    $ul.textContent = null;

    if (saveState) listState[url] = false;

    if (state === 'uncollapsed') {
      loading.start();
      if (saveState) listState[url] = true;

      try {
        const fs = fsOperation(url);
        let entries = await fs.lsDir();
        entries = helpers.sortDir(
          entries,
          {
            sortByName: true,
            showHiddenFiles: true,
          },
          true,
        );
        entries.map((entry) => {
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
      }
      loading.stop();
    }
  }
}

openFolder.updateHeight = function () {
  if (!addedFolder.length) return;
  let activeFileListHeight = 0;

  if (appSettings.value.openFileListPos === 'sidebar') {
    const client = editorManager.openFileList.getBoundingClientRect();
    activeFileListHeight = client.height;
  }

  let totalFolder = addedFolder.length - 1;
  for (let folder of addedFolder) {
    folder.$node.style.maxHeight = `calc(100% - ${
      totalFolder * 30 + activeFileListHeight
    }px)`;
    folder.$node.style.height = `calc(100% - ${
      totalFolder * 30 + activeFileListHeight
    }px)`;
  }
};

openFolder.updateItem = function (oldFile, newFile, newFilename) {
  const $el = editorManager.sidebar.querySelector(`[url="${oldFile}"]`);
  if ($el) {
    $el.data_url = newFile;
    $el.data_name = newFilename;
    $el.querySelector(':scope>span').className =
      helpers.getIconForFile(newFilename);
    $el.querySelector(':scope>.text').textContent = newFilename;
  }
};

openFolder.removeItem = function (url) {
  const $el = editorManager.sidebar.querySelector(`[url="${url}"]`);
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
  const regex = new RegExp('^' + url);
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
    const regex = new RegExp('^' + furl);
    return regex.test(url);
  });
};

export default openFolder;
