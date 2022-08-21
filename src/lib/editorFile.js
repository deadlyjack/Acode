import tag from 'html-tag-js';
import Url from '../utils/Url';
import path from '../utils/Path';
import constants from './constants';
import tile from '../components/tile';
import helpers from '../utils/helpers';
import dialogs from '../components/dialogs';
import fsOperation from '../fileSystem/fsOperation';

const modelist = ace.require('ace/ext/modelist');

/**
 *
 * @param {string} filename
 * @param {NewFileOptions} options
 */
export default function editorFile(filename = 'untitled.txt', options) {
  const {
    editor,
    getFile,
    switchFile,
    removeFile,
    emit,
    sidebar,
    openFileList: $openFileList,
  } = editorManager;

  if (!options) {
    options = {
      isUnsaved: false,
      render: true,
      id: constants.DEFAULT_FILE_SESSION,
    };
  }

  let uri = options.uri;
  let doesExists = null;
  if (options.id) doesExists = getFile(options.id, 'id');
  else if (uri) doesExists = getFile(uri, 'uri');
  else if (options.record) doesExists = getFile(options.record, options.type);

  if (doesExists) {
    if (editorManager.activeFile.id !== doesExists.id) {
      switchFile(doesExists.id);
    }
    return;
  }
  if (!('isUnsaved' in options)) {
    options.isUnsaved = true;
  }
  if (!('render' in options)) {
    options.render = true;
  }
  const text = options.text || '';
  let id = helpers.uuid();

  if (options.id) {
    id = options.id;
  } else if (uri) {
    id = uri.hashCode();
  }

  let editable = options.editable ?? true;
  const file = {
    loading: false,
    deletedFile: options.deletedFile,
    mode: options.mode,
    markChanged: true,
    session: ace.createEditSession(text),
    name: filename,
    type: options.type || 'regular',
    isUnsaved: options.isUnsaved,
    record: options.record,
    encoding: options.encoding || 'utf-8',
    readOnly: options.readOnly,
    assocTile: tile({
      text: filename,
      lead: tag('i', {
        className: helpers.getIconForFile(filename),
      }),
      tail: tag('span', {
        className: 'icon cancel',
        attr: {
          action: '',
        },
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          removeFile(file);
        },
      }),
    }),
    onsave() {
      if (this.uri === appSettings.settingsFile) {
        try {
          const settings = JSON.parse(this.session.getValue());
          appSettings.update(settings, false, false);
        } catch (error) { }
        return;
      }

      const onsave = options.onsave;
      if (onsave && typeof onsave === 'function') onsave.call(this);
    },
    get id() {
      return id;
    },
    set id(newId) {
      this.updateChangeFile(newId);
      id = newId;
    },
    setMode(mode) {
      this.session.setMode(mode);
      const filemode = modelist.getModeForPath(this.filename).mode;
      let tmpFileName;

      if (mode !== filemode) {
        const modeName = mode.split('/').slice(-1)[0];
        const exts = modelist.modesByName[modeName].extensions.split('|');
        const filename = path.parse(this.filename).name;

        for (let ext of exts) {
          if (/[a-z0-9]/.test(ext)) {
            tmpFileName = filename + '.' + ext;
            break;
          }
        }
        if (!tmpFileName) tmpFileName = filename + '.txt';
      } else {
        tmpFileName = this.filename;
      }

      this.assocTile.lead(
        tag('i', {
          className: helpers.getIconForFile(tmpFileName),
          style: {
            paddingRight: '5px',
          },
        }),
      );
    },
    get uri() {
      return uri;
    },
    set uri(newUri) {
      if (this.uri === newUri) return;
      if (newUri === null) {
        this.deletedFile = true;
        this.isUnsaved = true;
        this.id = helpers.uuid();
      } else {
        this.deletedFile = false;
        this.id = newUri.hashCode();
      }

      uri = newUri;
      this.type = 'regular';
      this.readOnly = false;
      editorManager.setSubText(this);
      editorManager.onupdate('file-uri');
    },
    get filename() {
      if (this.type === 'git') return this.record.name;
      else return this.name;
    },
    set filename(name) {
      if (this.name === name) return;

      (async () => {
        if (!name || this.mode === 'single') return;

        try {
          if (this.type === 'git') {
            await this.record.setName(name);
          } else if (this.type === 'gist') {
            await this.record.setName(this.name, name);
          }
        } catch (err) {
          dialogs.alert(strings.error, err.toString());
          console.error(err);
        }

        if (this.id === constants.DEFAULT_FILE_SESSION) {
          this.id = helpers.uuid();
        }
        if (editorManager.activeFile.id === this.id) {
          $header.text = name;
        }

        const oldExt = helpers.extname(this.name);
        const newExt = helpers.extname(name);
        this.assocTile.text = name;
        this.name = name;

        if (oldExt !== newExt) setupSession(this);

        editorManager.onupdate('file-name');
        emit('rename-file', this);
      })();
    },
    get location() {
      if (this.mode === 'single') return null;
      if (this.uri) {
        try {
          return Url.dirname(this.uri);
        } catch (error) {
          return null;
        }
      }
      return null;
    },
    set location(url) {
      if (this.mode === 'single' || this.location === url) return;
      if (url) {
        this.uri = Url.join(url, this.filename);
        if (this.readOnly) this.readOnly = false;
        return;
      }
      this.uri = null;
    },
    get eol() {
      return /\r/.test(this.session.getValue()) ? 'windows' : 'unix';
    },
    /**
     * Returns end of line of the file
     * @param {'windows'|'unix'} EOL
     */
    set eol(EOL) {
      if (this.eol === EOL) return;

      let text = this.session.getValue();
      if (EOL === 'windows') {
        text = text.replace(/(?<!\r)\n/g, '\r\n');
      } else {
        text = text.replace(/\r/g, '');
      }
      this.session.setValue(text);
    },
    get editable() {
      return editable;
    },
    set editable(value) {
      if (editable === value) return;
      editable = value;
      if (!value) {
        editor.setReadOnly(true);
      } else {
        editor.setReadOnly(false);
      }

      editorManager.onupdate('read-only');
      editorManager.emit('update', 'read-only');
    },
    async writeToCache() {
      let data = text;
      if (this.session) {
        data = this.session.getValue();
      }

      const cacheFs = fsOperation(Url.join(CACHE_STORAGE, this.id));

      try {
        if (!await cacheFs.exists()) {
          await fsOperation(CACHE_STORAGE)
            .createFile(this.id, data);
          return;
        }

        await cacheFs.writeFile(data);
      } catch (error) {
        console.error(error);
      }
    },
    async removeCacheFile() {
      try {
        const fs = fsOperation(Url.join(CACHE_STORAGE, this.id));
        if (!(await fs.exists())) return;
        await fs.delete();
      } catch (error) {
        console.error(error);
      }
    },
    async updateChangeFile(cacheNewName) {
      try {
        const fs = fsOperation(Url.join(CACHE_STORAGE, this.id));
        fs.renameTo(cacheNewName);
      } catch (error) { }
    },
    async isChanged() {
      if (!this.uri || this.readOnly) {
        if (this.id === constants.DEFAULT_FILE_SESSION) {
          this.id = helpers.uuid();
        }
        return true;
      }

      let fs;
      const protocol = Url.getProtocol(this.uri);
      if (/s?ftp:/.test(protocol)) {
        const cacheFile = Url.join(
          CACHE_STORAGE,
          protocol.slice(0, -1) + this.id,
        );
        fs = fsOperation(cacheFile);
      } else {
        fs = fsOperation(this.uri);
      }

      try {
        const oldText = await fs.readFile(this.encoding);
        const text = this.session.getValue();
        return oldText !== text;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    destroy() {
      this.session.off('changeScrollTop', onscrolltop);
      this.session.off('changeScrollLeft', onscrollleft);
      this.session.off('changeFold', onfold);
      this.removeCacheFile();
      this.session.destroy();
      this.assocTile.remove();
      this.session = null;
      this.assocTile = null;
    }
  };

  file.assocTile.classList.add('light');
  if (options.isUnsaved && !options.readOnly) {
    file.assocTile.classList.add('notice');
  }
  file.assocTile.addEventListener('click', function (e) {
    if (e.target.classList.contains('cancel')) return;
    if (editorManager.activeFile?.id === file.id) return;
    sidebar.hide();
    switchFile(file.id);
  });

  if (appSettings.value.openFileListPos === 'header') {
    $openFileList.append(file.assocTile);
  } else {
    $openFileList.$ul.append(file.assocTile);
  }

  editorManager.files.push(file);
  setupSession(file);

  // do not move to setupSession because setupSession is called multiple times
  // for e.g. on rename. so moving it to setupSession will cause multiple event
  // listeners to be added
  const { session } = file;
  session.on('changeScrollTop', onscrolltop);
  session.on('changeScrollLeft', onscrollleft);
  session.on('changeFold', onfold);

  if (options.render) {
    switchFile(file.id);

    if (file.id !== constants.DEFAULT_FILE_SESSION) {
      const defaultFile = getFile(constants.DEFAULT_FILE_SESSION, 'id');
      if (defaultFile) removeFile(defaultFile);
    }
  }

  if (file.id !== constants.DEFAULT_FILE_SESSION && options.text === undefined) {
    const { cursorPos, scrollTop, scrollLeft, folds } = options;
    loadText(file, cursorPos, scrollLeft, scrollTop, folds);
  }

  return file;
}

/**
 * 
 * @param {Array<Fold>} folds 
 */
function parseFolds(folds) {
  const { Fold } = ace.require('ace/edit_session/fold');
  const { Range } = ace.require('ace/range');
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

/**
 * 
 * @param {File} file 
 * @param {object} cursorPos
 */
async function loadText(file, cursorPos, scrollLeft, scrollTop, folds) {
  let value = null;

  editorManager.editor.setReadOnly(true);
  file.loading = true;
  file.markChanged = false;
  file.session.setValue(strings['loading...']);
  file.session.on('change', onTextSet);

  try {
    const cacheUrl = Url.join(CACHE_STORAGE, file.id);
    const cache = fsOperation(cacheUrl);
    if (await cache.exists()) {
      value = await cache.readFile('utf-8');
    }

    if (file.uri) {
      const fileEntry = fsOperation(file.uri);
      const fileExists = await fileEntry.exists();
      if (!fileExists) {
        file.deletedFile = true;
        file.isUnsaved = true;
      }
      if (value === null) {
        value = await fileEntry.readFile('utf-8');
      }
    }

    file.markChanged = false;
    file.session.setValue(value || '');
    file.loading = false;
    const { activeFile, editor } = editorManager;
    if (activeFile.id === file.id) {
      editor.setReadOnly(file.readOnly);
    }
  } catch (error) {
    file.session?.off('change', onTextSet);
    editorManager.removeFile(file.id, true);
    toast(`${strings['error']}: Unable to load file '${file.name}'`);
    console.error(error);
  }

  function onTextSet() {
    file.session.off('change', onTextSet);

    if (cursorPos) {
      setTimeout(() => {
        file.session.selection.moveCursorTo(cursorPos.row, cursorPos.column);
        file.session.setScrollTop(scrollTop);
        file.session.setScrollLeft(scrollLeft);

        if (Array.isArray(folds)) {
          file.session.addFolds(
            parseFolds(folds),
          );
        }
      }, 0);
    }
  }
}

function setupSession(file) {
  const { editor } = editorManager;
  const session = file.session;
  const filename = file.filename;
  const settings = appSettings.value;
  const ext = path.extname(filename);
  let mode;

  try {
    const modes = JSON.parse(localStorage.modeassoc);
    if (ext in modes) mode = modes[ext];
    else throw new Error('Mode not found');
  } catch (error) {
    mode = modelist.getModeForPath(filename).mode;
  }

  if (file.session.$modeId !== mode) {
    if (mode === 'ace/mode/text') {
      editor.setOptions({
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
      });
    } else {
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: settings.liveAutoCompletion,
      });
    }

    session.setTabSize(settings.tabSize);
    session.setUseSoftTabs(settings.softTab);
    session.setUseWorker(false);
    file.setMode(mode);
  }
  file.session.setUseWrapMode(settings.textWrap);
}

function onfold(e) {
  editorManager.editor._emit('fold', e);
}

function onscrolltop(e) {
  editorManager.editor._emit('scrolltop', e);
}

function onscrollleft(e) {
  editorManager.editor._emit('scrollleft', e);
}
