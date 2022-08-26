import tag from "html-tag-js";
import dialogs from "../components/dialogs";
import tile from "../components/tile";
import fsOperation from "../fileSystem/fsOperation";
import helpers from "../utils/helpers";
import Path from "../utils/Path";
import Url from "../utils/Url";
import constants from "./constants";
import openFolder from "./openFolder";

const modelist = ace.require('ace/ext/modelist');
const { Fold } = ace.require('ace/edit_session/fold');
const { Range } = ace.require('ace/range');

/**
 * @typedef {object}  FileOptions new file options
 * @property {boolean} [isUnsaved] weather file needs to saved
 * @property {render} [render] make file active
 * @property {string} [id] ID fo the file
 * @property {string} [uri] uri of the file
 * @property {GitRecord & GistRecord} [record] git/gist record
 * @property {string} [text] session text
 * @property {boolean} [editable] eable file to edit or not
 * @property {boolean} [deletedFile] file do not exists at source
 * @property {'single' | 'tree'} [SAFMode] storage access framework mode
 * @property {string} [encoding] text encoding
 * @property {object} [cursorPos] cursor position
 * @property {number} [scrollLeft] scroll left
 * @property {number} [scrollTop] scroll top
 * @property {Array<Fold>} [folds] folds
 */

export default class EditorFile {
  /**
   * State of the editor for this file.
   */
  focused = false;
  /**
   * Weather the file has completed loading text or not
   * @type {boolean}
   */
  loaded = true;
  /**
   * Weather file is still loading the text from the source
   * @type {boolean}
   */
  loading = false;
  /**
   * Weather file is deleted from source.
   * @type {boolean}
   */
  deletedFile = false;
  /**
   * EditSession of the file
   * @type {AceAjax.IEditSession}
   */
  session = null;
  /**
   * Type of file
   * @type {'regular'| 'git' | 'gist'}
   */
  type = 'regular';
  /**
   * If file type is 'git' or 'gist' it will have this property to read/write/modify file
   * @type {GitRecord & GistRecord}
   */
  record = null;
  /**
   * Encoding of the text e.e. 'utf-8'
   * @type {string}
   */
  encoding = 'utf-8';
  /**
   * Weather file is readonly
   * @type {boolean}
   */
  readOnly = false;
  /**
   * mark change when session text is changed
   * @type {boolean}
   */
  markChanged = true;
  /**
   * @type {string} file syntax highliting mode
   */
  #mode = 'ace/mode/text';
  /**
   * Storage access framework file mode
   * @type {'single' | 'tree' | null}
   */
  #SAFMode = null;
  /**
   * Name of the file
   * @type {string}
   */
  #name = constants.DEFAULT_FILE_NAME;
  /**
   * Location of the file
   * @type {string}
   */
  #uri;
  /**
   * Unique ID of the file, changed when file is renamed or location/uri is changed.
   * @type {string}
   */
  #id = constants.DEFAULT_FILE_SESSION;
  /**
   * Associated tile for the file, that is appened in the open file list,
   * when clicked make the file active.
   * @type {HTMLElement}
   */
  #tab;
  /**
   * Weather file can be edited or not
   * @type {boolean}
   */
  #editable = true;
  /**
   * contains information about cursor position, scroll left, scroll top, folds.
   */
  #loadOptions;
  /**
   * Weather file is changed and needs to be saved
   * @type {boolean}
   */
  #isUnsaved = false;

  /**
   * 
   * @param {string} [filename] name of file.
   * @param {FileOptions} [options]  file create options
   */
  constructor(filename, options) {
    const {
      openFileList,
      files,
      getFile,
      header,
    } = editorManager;
    let doesExists = null;

    // if options are passed
    if (options) {
      // if options doesn't contains id, and provide a new id
      if (!options.id) {
        if (options.uri) this.#id = options.uri.hashCode();
        else this.#id = helpers.uuid();
      } else this.#id = options.id;
    } else if (!options) {
      // if options aren't passed, that means default file is being created
      this.#id = constants.DEFAULT_FILE_SESSION;
    }

    this.#uri = options?.uri;
    this.record = options?.record;
    this.type = options?.type ?? 'regular';

    if (this.#id) doesExists = getFile(this.#id, 'id');
    else if (this.#uri) doesExists = getFile(this.#uri, 'uri');
    else if (this.record) doesExists = getFile(this.record, this.type);

    if (doesExists) {
      doesExists.makeActive();
      return;
    }

    if (filename) this.#name = filename;

    this.#tab = tile({
      text: this.#name,
      tail: tag('span', {
        className: 'icon cancel',
        dataset: {
          action: 'close-file'
        }
      })
    });

    this.#SAFMode = options?.SAFMode;
    this.isUnsaved = options?.isUnsaved ?? false;
    this.encoding = options?.encoding ?? 'utf-8';
    this.editable = options?.editable ?? true;
    // if options contains text property then there is no need to load
    // set loaded true i.e. text is no undefi

    if (this.#id !== constants.DEFAULT_FILE_SESSION) {
      this.loaded = options?.text !== undefined;
    }

    // if not loaded then create load options
    if (!this.loaded) {
      this.#loadOptions = {
        cursorPos: options?.cursorPos,
        scrollLeft: options?.scrollLeft,
        scrollTop: options?.scrollTop,
        folds: options?.folds,
      }
    }

    this.#tab.onclick = (e) => {
      const { action } = e.target.dataset;
      if (action === 'close-file') {
        this.remove();
        return;
      }
      this.makeActive();
    };

    if (appSettings.value.openFileListPos === 'header') {
      openFileList.append(this.#tab);
    } else {
      openFileList.$ul.append(this.#tab);
    }

    files.push(this);
    header.text = this.#name;
    this.session = ace.createEditSession(options?.text || '');
    this.setMode();
    this.#setupSession();

    if (options?.render ?? true) {
      this.makeActive();

      if (this.id !== constants.DEFAULT_FILE_SESSION) {
        const defaultFile = editorManager.getFile(constants.DEFAULT_FILE_SESSION, 'id');
        defaultFile?.remove();
      }
    }
  }

  /**
   * File unique id.
   */
  get id() {
    return this.#id;
  }

  /**
  * File unique id.
  * @param {string} value
  */
  set id(value) {
    this.#renameCacheFile(value);
    this.#id = value;
  }

  /**
   * File name
   */
  get filename() {
    if (this.type === 'git') return this.record.name;
    return this.#name;
  }
  /**
   * File name
   * @param {string} value
   */
  set filename(value) {
    if (!value || this.#SAFMode === 'single') return;
    if (this.#name === value) return;

    (async () => {
      try {
        if (this.type === 'git') {
          await this.record.setName(value);
        } else if (this.type === 'gist') {
          await this.record.setName(this.#name, value);
        }
      } catch (error) {
        helpers.error(error);
      }

      if (this.id === constants.DEFAULT_FILE_SESSION) {
        this.id = helpers.uuid();
      }

      if (editorManager.activeFile.id === this.id) {
        editorManager.header.text = value;
      }


      editorManager.onupdate('rename-file');
      editorManager.emit('rename-file', this);

      const oldExt = helpers.extname(this.#name);
      const newExt = helpers.extname(value);

      this.#tab.text = value;
      this.#name = value;

      if (oldExt !== newExt) this.setMode();
    })();
  }

  /**
   * Location of the file i.e. dirname
   */
  get location() {
    if (this.#SAFMode === 'single') return null;
    if (this.#uri) {
      try {
        return Url.dirname(this.#uri)
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /**
   * Location of the file i.e. dirname
   * @param {string} value
   */
  set location(value) {
    if (!value) return;
    if (this.#SAFMode === 'single') return;
    if (this.location === value) return;

    this.uri = Url.join(value, this.filename);
    this.readOnly = false;
  }

  /**
   * File location on the deive
   */
  get uri() {
    return this.#uri;
  }

  /**
   *  File location on the deive
   * @param {string} value
   */
  set uri(value) {
    if (this.#uri === value) return;
    if (!value) {
      this.deletedFile = true;
      this.isUnsaved = true;
      this.#uri = null;
      this.id = helpers.uuid();
    } else {
      this.#uri = value;
      this.deletedFile = false;
      this.readOnly = false;
      this.type = 'regular';
      this.id = value.hashCode();
    }

    editorManager.onupdate('rename-file');
    editorManager.emit('rename-file', this);

    // if this file is active set sub text of header
    if (editorManager.activeFile.id === this.id) {
      editorManager.setSubText(this);
    }
  }

  /**
   * End of line
   */
  get eol() {
    return /\r/.test(this.session.getValue()) ? 'windows' : 'unix';
  }

  /**
   * End of line
   * @param {'windows'|'unit'} value
   */
  set eol(value) {
    if (this.eol === value) return;
    let text = this.session.getValue();

    if (value === 'windows') {
      text = text.replace(/(?<!\r)\n/g, '\r\n');
    } else {
      text = text.replace(/\r/g, '');
    }

    this.session.setValue(text);
  }

  /**
   * Weather file can be edit.
   */
  get editable() {
    return this.#editable;
  }

  /**
   * Weather file can be edit.
   * @param {boolean} value
   */
  set editable(value) {
    if (this.#editable === value) return;
    editorManager.editor.setReadOnly(!value);
    editorManager.onupdate('read-only');
    editorManager.emit('update', 'read-only');
    this.#editable = value;
  }

  get isUnsaved() {
    return this.#isUnsaved;
  }

  set isUnsaved(value) {
    if (this.#isUnsaved === value) return;
    this.#isUnsaved = value;

    this.#upadteSaveIcon();
    this.#updateTab();
  }
  /**
   * DON'T remove, plugin need this property to get filename.
   */
  get name() {
    return this.#name;
  }

  /**
   * Readonly, cahce file url
   */
  get cahceFile() {
    return Url.join(CACHE_STORAGE, this.#id);
  }

  /**
   * File icon
   */
  get icon() {
    const modeName = this.#mode.split('/').pop();
    const fileType = helpers.getFileType(this.filename);
    return `file file_type_${modeName} file_type_${fileType}`
  }

  get tab() {
    return this.#tab;
  }

  async writeToCache() {
    const text = this.session.getValue();
    const fs = fsOperation(this.cahceFile);

    try {
      if (!await fs.exists()) {
        await fsOperation(CACHE_STORAGE).createFile(this.id, text);
        return;
      }

      await fs.writeFile(text);
    } catch (error) {
      console.error(error);
    }
  }

  async isChanged() {
    // if file is not loaded or is loading then it is not changed.
    if (!this.loaded || this.loading) {
      return false;
    }
    // is changed is called when session text is changed
    // if file has no uri or is readonly that means file is change
    // and need to saved to a location.
    // here readonly means file has uri but has no write permission.
    if (!this.uri || this.readOnly) {
      // if file is defautl file and text is changed
      if (this.id === constants.DEFAULT_FILE_SESSION) {
        // change id when text is changed
        this.id = helpers.uuid();
      }
      return true;
    }

    const protocol = Url.getProtocol(this.#uri);
    let fs;
    if (/s?ftp:/.test(protocol)) {
      // if file is a ftp or sftp file, get file content forom cahced file.
      // remove ':' from protocol because cache file of remote files are
      // stored as ftp102525465N i.e. protocol + id
      const cacheFilename = protocol.slice(0, -1) + this.id;
      const cacheFile = Url.join(CACHE_STORAGE, cacheFilename);
      fs = fsOperation(cacheFile);
    } else {
      fs = fsOperation(this.uri);
    }

    try {
      const oldText = await fs.readFile(this.encoding);
      const text = this.session.getValue();

      if (oldText.length !== text.length) return true;
      return oldText !== text;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async canRun() {
    try {
      if (!this.loaded || this.loading) return false;
      if (this.type === 'regular') {
        const folder = openFolder.find(this.uri);
        if (folder) {
          const url = Url.join(folder.url, 'index.html');
          const fs = fsOperation(url);
          if (await fs.exists()) {
            return url;
          }
        }
      }

      const runnableFile = /\.((html?)|(md)|(js)|(svg))$/;
      if (runnableFile.test(this.filename)) return true;
      return false;
    } catch (err) {
      if (err instanceof Error) throw error;
      else throw new Error(err);
    }
  }

  /**
   * Remove and closes the file.
   * @param {boolean} force if true, will prompt to save the file
   */
  async remove(force = false) {
    if (this.id === constants.DEFAULT_FILE_SESSION && !editorManager.files.length) return;
    if (!force && this.isUnsaved) {
      const confirmation = await dialogs.confirm(strings.warning.toUpperCase(), strings['unsaved file']);
      if (!confirmation) return;
    }

    if (this.type === 'git') {
      gitRecord.remove(this.record.sha);
    } else if (this.type === 'gist') {
      gistRecord.remove(this.record);
    }

    this.#destroy();

    editorManager.files = editorManager.files.filter((file) => file.id !== this.id);
    const { files, sidebar, activeFile } = editorManager;
    if (activeFile.id === this.id) {
      editorManager.activeFile = null;
    }
    if (!files.length) {
      sidebar.hide();
      editorManager.activeFile = null;
      new EditorFile();
    } else {
      files[files.length - 1].makeActive();
    }
    editorManager.onupdate('remove-file');
    editorManager.emit('remove-file', this);
  }

  /**
   * Sets syntax highlighting of the file.
   * @param {string} [mode] 
   */
  setMode(mode) {
    if (!mode) {
      const ext = Path.extname(this.filename);
      const modes = helpers.parseJSON(localStorage.modeassoc);
      if (modes?.[ext]) mode = modes[ext];
      else mode = modelist.getModeForPath(this.filename).mode;
    }

    // sets ace editor EditSession mode
    this.session.setMode(mode);
    this.#mode = mode;

    // sets file icon
    this.#tab.lead(
      tag('span', {
        className: this.icon,
        style: {
          paddingRight: '5px',
        },
      }),
    );
  }

  /**
   * Makes this file active
   */
  makeActive() {
    const { activeFile, editor, switchFile } = editorManager;
    if (activeFile?.id === this.id) return;
    switchFile(this.id);

    if (this.focused) {
      editor.focus();
    } else {
      editor.blur();
    }

    this.#upadteSaveIcon();
    this.#tab.classList.add('active');
    this.#tab.scrollIntoView();
    if (!this.loaded && !this.loading) {
      this.#loadText();
    }
  }

  /**
   * Rename cache file.
   * @param {String} newId
   */
  async #renameCacheFile(newId) {
    try {
      const fs = fsOperation(this.cahceFile);
      if (!await fs.exists()) return;
      fs.renameTo(newId);
    } catch (error) {
      console.error('renameCahceFile', error);
    }
  }

  /**
   * Removes cache file
   */
  async #removeCache() {
    try {
      const fs = fsOperation(this.cahceFile);
      if (!await fs.exists()) return;
      await fs.delete();
    } catch (error) {
      console.error(error);
    }
  }

  async #loadText() {
    const { cursorPos, scrollLeft, scrollTop, folds } = this.#loadOptions;
    const { editor } = editorManager;
    let value;

    this.#loadOptions = null;

    editor.setReadOnly(true);
    this.loading = true;
    this.markChanged = false;
    this.session.setValue(strings['loading...']);

    try {
      const cacheFs = fsOperation(this.cahceFile);
      if (await cacheFs.exists()) {
        value = await cacheFs.readFile('utf-8');
      }

      if (this.uri) {
        const file = fsOperation(this.uri);
        if (!await file.exists()) {
          this.deletedFile = true;
          this.isUnsaved = true;
        } else if (value === undefined) {
          value = await file.readFile('utf-8');
        }
      } else if (!value) {
        if (this.type === 'gist') {
          const gistFile = this.record.files[this.filename];
          value = gistFile.content;
        } else if (this.type === 'git') {
          value = this.record.data;
        }
      }

      this.markChanged = false;
      this.session.setValue(value || '');
      this.loaded = true;
      this.loading = false;

      const { activeFile, emit } = editorManager;
      if (activeFile.id === this.id) {
        editor.setReadOnly(false);
      }

      setTimeout(() => {
        emit('file-loaded', this);
        if (cursorPos) this.session.selection.moveCursorTo(cursorPos.row, cursorPos.column);
        if (scrollTop) this.session.setScrollTop(scrollTop);
        if (scrollLeft) this.session.setScrollLeft(scrollLeft);

        if (Array.isArray(folds)) {
          const parsedFolds = EditorFile.#parseFolds(folds);
          this.session.addFolds(parsedFolds);
        }
      }, 0);
    } catch (error) {
      this.remove();
      toast(`Unable to load: ${this.filename}`);
      console.log(error);
    }
  }

  static #onfold(e) {
    editorManager.editor._emit('fold', e);
  }

  static #onscrolltop(e) {
    editorManager.editor._emit('scrolltop', e);
  }

  static #onscrollleft(e) {
    editorManager.editor._emit('scrollleft', e);
  }

  /**
   * Parse folds 
   * @param {Array<Fold>} folds 
   */
  static #parseFolds(folds) {
    if (!Array.isArray(folds)) return;
    const foldDataAr = [];
    folds.forEach(fold => {
      const { range } = fold;
      const { start, end } = range;
      const foldData = new Fold(
        new Range(
          start.row,
          start.column,
          end.row,
          end.column
        ),
        fold.placeholder,
      );

      if (fold.ranges.length > 0) {
        const subFolds = parseFolds(fold.ranges);
        foldData.subFolds = subFolds;
        foldData.ranges = subFolds;
      }

      foldDataAr.push(foldData);
    });
    return foldDataAr;
  }

  #upadteSaveIcon() {
    const $save = root.get('#quick-tools [action=save]');
    if (this.#isUnsaved) {
      $save?.classList.add('notice');
    } else {
      $save?.classList.remove('notice');
    }
  }

  #updateTab() {
    if (this.#isUnsaved) {
      this.tab.classList.add('notice');
    } else {
      this.tab.classList.remove('notice');
    }
  }

  /**
   * Setup Ace EditSession for the file
   */
  #setupSession() {
    const { value: settings } = appSettings;

    this.session.setTabSize(settings.tabSize);
    this.session.setUseSoftTabs(settings.softTab);
    this.session.setUseWrapMode(settings.textWrap);
    this.session.setUseWorker(false);

    this.session.on('changeScrollTop', EditorFile.#onscrolltop);
    this.session.on('changeScrollLeft', EditorFile.#onscrollleft);
    this.session.on('changeFold', EditorFile.#onfold);
  }

  #destroy() {
    this.session.off('changeScrollTop', EditorFile.#onscrolltop);
    this.session.off('changeScrollLeft', EditorFile.#onscrollleft);
    this.session.off('changeFold', EditorFile.#onfold);
    this.#removeCache();
    this.session.destroy();
    this.#tab.remove();
    delete this.session;
    this.#tab = null;
  }
}