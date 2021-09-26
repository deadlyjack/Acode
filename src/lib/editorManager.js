import list from '../components/collapsableList';
import clipboardAction from './clipboard';
import tag from 'html-tag-js';
import tile from '../components/tile';
import dialogs from '../components/dialogs';
import helpers from './utils/helpers';
import textControl from './handlers/selection';
import constants from './constants';
import openFolder from './openFolder';
import Url from './utils/Url';
import path from './utils/Path';
import configEditor from './aceConfig';
import ScrollBar from '../components/scrollbar/scrollbar';
import fsOperation from './fileSystem/fsOperation';

//TODO: Add customizable tools bar
//TODO: Add option to work multiple files at same time in large display.

/**
 *
 * @param {HTMLElement} $sidebar
 * @param {HTMLElement} $header
 * @param {HTMLElement} $body
 * @returns {Manager}
 */
function EditorManager($sidebar, $header, $body) {
  /**
   * @type {Collaspable & HTMLElement}
   */
  let $openFileList;
  let checkTimeout = null;
  let TIMEOUT_VALUE = 500;
  let lastHeight = innerHeight;
  let editorState = 'blur';
  let preventScrollbarV = false;
  let preventScrollbarH = false;
  let scrollBarVisiblityCount = 0;
  let cursorControllerSize = appSettings.value.cursorControllerSize;
  let timeoutQuicktoolToggler;
  let timeoutHeaderToggler;
  const $container = tag('div', {
    className: 'editor-container',
  });
  /**
   * @type {AceAjax.Editor}
   */
  const editor = ace.edit($container);
  const readOnlyContent = `<span action="copy">${strings.copy}</span><span action="select all">${strings['select all']}<span>`;
  const fullContent = `<span action="copy">${strings.copy}</span><span action="cut">${strings.cut}</span><span action="paste">${strings.paste}</span><span action="select all">${strings['select all']}</span>`;
  const scrollbarSize = appSettings.value.scrollbarSize;
  const $vScrollbar = ScrollBar({
    width: scrollbarSize,
    onscroll: onscrollV,
    onscrollend: onscrollVend,
    parent: $body,
  });
  const $hScrollbar = ScrollBar({
    width: scrollbarSize,
    onscroll: onscrollH,
    onscrollend: onscrollHend,
    parent: $body,
    direction: 'bottom',
  });
  const controls = {
    start: tag('span', {
      className: 'cursor-control start ' + cursorControllerSize,
    }),
    end: tag('span', {
      className: 'cursor-control end ' + cursorControllerSize,
    }),
    menu: tag('div', {
      className: 'clipboard-contextmneu',
      innerHTML: fullContent,
    }),
    color: tag('span', {
      className: 'icon color',
      attr: {
        action: 'color',
      },
    }),
    vScrollbar: $vScrollbar,
    hScrollbar: $hScrollbar,
    fullContent,
    readOnlyContent,
    get size() {
      return cursorControllerSize;
    },
    set size(s) {
      cursorControllerSize = s;

      const sizes = ['large', 'small', 'none'];
      this.start.classList.remove(...sizes);
      this.end.classList.remove(...sizes);
      this.start.classList.add(s);
      this.end.classList.add(s);
    },
    update: () => {},
    checkForColor: function () {
      const copyTxt = editor.getCopyText();
      const readOnly = editor.getReadOnly();

      if (this.color.isConnected && readOnly) {
        this.color.remove();
      } else {
        if (copyTxt) this.color.style.color = copyTxt;

        if (readOnly) this.color.classList.add('disabled');
        else this.color.classList.remove('disabled');

        if (!this.color.isConnected) controls.menu.appendChild(this.color);
      }
    },
  };
  /**@type {Manager}*/
  const manager = {
    editor,
    addNewFile,
    getFile,
    switchFile,
    activeFile: null,
    onupdate: () => {},
    hasUnsavedFiles,
    files: [],
    removeFile,
    controls,
    setSubText,
    moveOpenFileList,
    sidebar: $sidebar,
    container: $container,
    scroll: {
      $vScrollbar,
      $hScrollbar,
    },
    get state() {
      return editorState;
    },
    get TIMEOUT_VALUE() {
      return TIMEOUT_VALUE;
    },
    get openFileList() {
      return $openFileList;
    },
  };

  configEditor(editor);
  $container.classList.add(appSettings.value.editorFont);
  moveOpenFileList();
  $body.appendChild($container);
  setupEditor();
  textControl(editor, $container);
  controls.menu.ontouchend = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const action = e.target.getAttribute('action');
    if (action) {
      clipboardAction(action);
    }
  };

  $hScrollbar.onshow = $vScrollbar.onshow = updateFloatingButton.bind(
    {},
    false,
  );
  $hScrollbar.onhide = $vScrollbar.onhide = updateFloatingButton.bind({}, true);

  window.addEventListener('resize', () => {
    if (innerHeight > lastHeight) {
      editor.blur();
      editorState = 'blur';
    }
    lastHeight = innerHeight;
    editor.renderer.scrollCursorIntoView();
  });

  editor.on('focus', () => {
    editorState = 'focus';
    $hScrollbar.hide();
    $vScrollbar.hide();
  });

  editor.on('change', function (e) {
    if (checkTimeout) clearTimeout(checkTimeout);
    checkTimeout = setTimeout(() => {
      const { activeFile } = manager;
      (async () => {
        const changed = await activeFile.isChanged();
        if (!changed) {
          activeFile.isUnsaved = false;
        } else {
          activeFile.writeToCache();
          if (activeFile.markChanged) {
            activeFile.isUnsaved = true;
          }
          activeFile.markChanged = true;
        }
        manager.onupdate('file-changed');
      })();
    }, TIMEOUT_VALUE);
  });

  appSettings.on('update:textWrap', function (value) {
    for (let file of manager.files) {
      file.session.setUseWrapMode(value);
      if (!value) file.session.on('changeScrollLeft', onscrollleft);
      else file.session.off('changeScrollLeft', onscrollleft);
    }
  });

  appSettings.on('update:tabSize', function (value) {
    for (let file of manager.files) file.session.setTabSize(value);
  });

  appSettings.on('update:softTab', function (value) {
    for (let file of manager.files) file.session.setUseSoftTabs(value);
  });

  appSettings.on('update:showSpaces', function (value) {
    editor.setOption('showInvisibles', value);
  });

  appSettings.on('update:editorFont', function (value) {
    $container.classList.remove(this.editorFont);
    $container.classList.add(value);
  });

  appSettings.on('update:fontSize', function (value) {
    editor.setFontSize(value);
  });

  appSettings.on('update:openFileListPos', function (value) {
    moveOpenFileList();
    controls.vScrollbar.resize();
  });

  appSettings.on('update:showPrintMargin', function (value) {
    editorManager.editor.setOption('showPrintMargin', value);
  });

  appSettings.on('update:cursorControllerSize', function (value) {
    controls.size = value;
  });

  appSettings.on('update:scrollbarSize', function (value) {
    controls.vScrollbar.size = value;
    controls.hScrollbar.size = value;
  });

  appSettings.on('update:liveAutoCompletion', function (value) {
    editor.setOption('enableLiveAutocompletion', value);
  });

  appSettings.on('update:linting', function (value) {
    for (let file of manager.files) file.session.setUseWorker(value);

    if (value) editor.renderer.setMargin(0, 0, 0, 0);
    else editor.renderer.setMargin(0, 0, -16, 0);
  });

  appSettings.on('update:linenumbers', function (value) {
    editor.setOptions({
      showGutter: value,
      showLineNumbers: value,
    });
    if (value) editor.renderer.setMargin(0, 0, -16, 0);
    else editor.renderer.setMargin(0, 0, 0, 0);
    editor.resize(true);
  });

  appSettings.on('update:lineHeight', function (value) {
    editor.container.style.lineHeight = value;
  });

  /**
   * Callback function
   * @param {Number} value
   */
  function onscrollV(value) {
    preventScrollbarV = true;
    const session = editor.getSession();
    const editorHeight = getEditorHeight();
    const scroll = editorHeight * value;

    session.setScrollTop(scroll);
  }

  function onscrollVend() {
    preventScrollbarV = false;
  }

  /**
   * Callback function
   * @param {Number} value
   */
  function onscrollH(value) {
    preventScrollbarH = true;
    const session = editor.getSession();
    const editorWidth = getEditorWidth();
    const scroll = editorWidth * value;

    session.setScrollLeft(scroll);
  }

  function onscrollHend() {
    preventScrollbarH = false;
  }

  /**
   * Callback function called on scroll vertically
   * @param {Boolean} render
   */
  function onscrollleft(render = true) {
    if (preventScrollbarH) return;
    const session = editor.getSession();
    const editorWidth = getEditorWidth();
    const factor = (session.getScrollLeft() / editorWidth).toFixed(2);

    $hScrollbar.value = factor;
    if (render) $hScrollbar.render();
  }

  /**
   * Callback function called on scroll vertically
   * @param {Boolean} render
   */
  function onscrolltop(render = true) {
    if (preventScrollbarV) return;
    const session = editor.getSession();
    const editorHeight = getEditorHeight();
    const factor = (session.getScrollTop() / editorHeight).toFixed(2);

    $vScrollbar.value = factor;
    if (render) $vScrollbar.render();
  }

  /**
   * @returns {number}
   */
  function getEditorHeight() {
    const renderer = editor.renderer;
    const session = editor.getSession();
    const offset = (renderer.$size.scrollerHeight + renderer.lineHeight) * 0.5;
    const editorHeight =
      session.getScreenLength() * renderer.lineHeight - offset;
    return editorHeight;
  }

  function getEditorWidth() {
    const renderer = editor.renderer;
    const session = editor.getSession();
    const offset = renderer.$size.scrollerWidth - renderer.characterWidth;
    const editorWidth =
      session.getScreenWidth() * renderer.characterWidth - offset;
    return editorWidth;
  }

  function updateFloatingButton(show = false) {
    const { $quickToolToggler, $headerToggler } = Acode;

    if (show) {
      if (scrollBarVisiblityCount) --scrollBarVisiblityCount;

      if (!scrollBarVisiblityCount) {
        clearTimeout(timeoutHeaderToggler);
        clearTimeout(timeoutQuicktoolToggler);

        if (appSettings.value.floatingButton) {
          $quickToolToggler.classList.remove('hide');
          root.append($quickToolToggler);
        }

        $headerToggler.classList.remove('hide');
        root.append($headerToggler);
      }
    } else {
      if (!scrollBarVisiblityCount) {
        if ($quickToolToggler.isConnected) {
          $quickToolToggler.classList.add('hide');
          timeoutQuicktoolToggler = setTimeout(
            () => $quickToolToggler.remove(),
            300,
          );
        }
        if ($headerToggler.isConnected) {
          $headerToggler.classList.add('hide');
          timeoutHeaderToggler = setTimeout(() => $headerToggler.remove(), 300);
        }
      }

      ++scrollBarVisiblityCount;
    }
  }

  /**
   *
   * @param {string} filename
   * @param {NewFileOptions} options
   */
  function addNewFile(filename = 'untitled.txt', options) {
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
      if (manager.activeFile.id !== doesExists.id) switchFile(doesExists.id);
      return;
    }
    if (!('isUnsaved' in options)) {
      options.isUnsaved = true;
    }
    if (!('render' in options)) {
      options.render = true;
    }
    const removeBtn = tag('span', {
      className: 'icon cancel',
      attr: {
        action: '',
      },
      onclick: () => {
        removeFile(file);
      },
    });
    const assocTile = tile({
      lead: tag('i', {
        className: helpers.getIconForFile(filename),
      }),
      text: filename,
      tail: removeBtn,
    });
    const text = options.text || '';
    let id = helpers.uuid();

    if (options.id) {
      id = options.id;
    } else if (uri) {
      id = uri.hashCode();
    }

    let file = {
      deletedFile: options.deletedFile,
      mode: options.mode,
      markChanged: true,
      controls: false,
      session: ace.createEditSession(text),
      name: filename,
      editable: true,
      type: options.type || 'regular',
      isUnsaved: options.isUnsaved,
      record: options.record,
      encoding: 'utf-8',
      assocTile,
      readOnly: options.readOnly,
      onsave() {
        if (this.uri === appSettings.settingsFile) {
          try {
            const settings = JSON.parse(this.session.getValue());
            appSettings.update(settings, false, false);
          } catch (error) {}
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
        setSubText(this);
        manager.onupdate('file-uri');
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
          if (manager.activeFile.id === this.id) {
            $header.text = name;
          }

          const oldExt = helpers.extname(this.name);
          const newExt = helpers.extname(name);
          this.assocTile.text = name;
          this.name = name;

          if (oldExt !== newExt) setupSession(this);

          manager.onupdate('file-name');
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
      async writeToCache() {
        const cacheFs = fsOperation(Url.join(CACHE_STORAGE, this.id));
        const exists = await cacheFs.exists();

        if (!exists) {
          const dirFs = fsOperation(CACHE_STORAGE);
          await dirFs.createFile(this.id);
        }

        let data = text;
        if (this.session) {
          data = this.session.getValue();
        }
        try {
          await cacheFs.writeFile(data);
        } catch (error) {
          console.error(error);
        }
      },
      async removeCacheFile() {
        try {
          const fs = fsOperation(Url.join(CACHE_STORAGE, this.id));
          fs.deleteFile();
        } catch (error) {}
      },
      async updateChangeFile(cacheNewName) {
        try {
          const fs = fsOperation(Url.join(CACHE_STORAGE, this.id));
          fs.renameTo(cacheNewName);
        } catch (error) {}
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
          const oldText = await fs.readFile('utf-8');
          const text = this.session.getValue();
          return oldText !== text;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
    };

    file.assocTile.classList.add('light');
    if (options.isUnsaved && !options.readOnly) {
      file.assocTile.classList.add('notice');
    }
    file.assocTile.addEventListener('click', function (e) {
      if (
        manager.activeFile &&
        (e.target === removeBtn || manager.activeFile.id === file.id)
      )
        return;

      $sidebar.hide();
      switchFile(file.id);
    });

    if (appSettings.value.openFileListPos === 'header') {
      $openFileList.append(file.assocTile);
    } else {
      $openFileList.$ul.append(file.assocTile);
    }

    manager.files.push(file);
    setupSession(file);

    if (options.render) {
      switchFile(file.id);
      if (options.cursorPos) editor.moveCursorToPosition(options.cursorPos);

      if (id !== constants.DEFAULT_FILE_SESSION) {
        const defaultFile = getFile(constants.DEFAULT_FILE_SESSION, 'id');
        if (defaultFile) removeFile(defaultFile);
      }
    }

    setTimeout(() => {
      file.writeToCache();
      editor.resize(true);
    }, 0);

    file.session.on('changeScrollTop', onscrolltop);
    if (!appSettings.value.textWrap) {
      file.session.on('changeScrollLeft', onscrollleft);
    }

    return file;
  }

  /**
   *
   * @param {File} file
   */
  function setSubText(file) {
    let text = file.location || file.uri;

    if (file.type === 'git') {
      text = 'git • ' + file.record.repo + '/' + file.record.path;
    } else if (file.type === 'gist') {
      const id = file.record.id;
      text = `gist • ${
        id.length > 10 ? '...' + id.substring(id.length - 7) : id
      }`;
    } else if (text && !file.readOnly) {
      text = helpers.getVirtualPath(text);
      if (text.length > 30) text = '...' + text.slice(text.length - 27);
    } else if (file.readOnly) {
      text = strings['read only'];
    } else if (file.deletedFile) {
      text = strings['deleted file'];
    } else {
      text = strings['new file'];
    }
    $header.subText = text;
  }

  function switchFile(id) {
    for (let file of manager.files) {
      if (id === file.id) {
        if (manager.activeFile) {
          manager.activeFile.assocTile.classList.remove('active');
        }

        editor.setSession(file.session);
        if (manager.state === 'focus') editor.focus();
        setTimeout(controls.update, 100);

        $header.text = file.filename;
        setSubText(file);
        file.assocTile.classList.add('active');
        manager.activeFile = file;
        manager.onupdate('switch-file');
        file.assocTile.scrollIntoView();

        $hScrollbar.remove();
        $vScrollbar.remove();
        onscrolltop(false);
        if (!appSettings.value.textWrap) onscrollleft(false);
        return;
      }
    }

    manager.onupdate('switch-file');
  }

  function setupEditor() {
    ace.require('ace/ext/emmet');
    const settings = appSettings.value;

    editor.setFontSize(settings.fontSize);
    editor.setHighlightSelectedWord(true);

    editor.setOptions({
      animatedScroll: false,
      tooltipFollowsMouse: false,
      theme: settings.editorTheme,
      showGutter: settings.linenumbers,
      showLineNumbers: settings.linenumbers,
      enableEmmet: true,
      showInvisibles: settings.showSpaces,
      indentedSoftWrap: false,
      scrollPastEnd: 0.5,
      showPrintMargin: settings.showPrintMargin,
    });

    editor.container.style.lineHeight = settings.lineHeight || 2;

    if (!appSettings.value.linting && appSettings.value.linenumbers) {
      editor.renderer.setMargin(0, 0, -16, 0);
    }
  }

  function setupSession(file) {
    const session = file.session;
    const filename = file.filename;
    const settings = appSettings.value;
    const ext = path.extname(filename);
    let mode;

    try {
      const modes = JSON.parse(localStorage.modeassoc);
      const ext = path.extname(filename);
      if (ext in modes) mode = modes[ext];
      else throw new Error('Mode not found');
    } catch (error) {
      mode = modelist.getModeForPath(filename).mode;
    }

    let useWorker = appSettings.value.linting;

    if (ext === '.jsx') useWorker = false;

    session.setOption('useWorker', useWorker);

    if (file.session.$modeId !== mode) {
      if (mode === 'ace/mode/text') {
        editor.setOptions({
          enableBasicAutocompletion: false,
          enableSnippets: false,
          enableLiveAutocompletion: false,
        });
      } else {
        editor.setOptions({
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: settings.liveAutoCompletion,
        });
      }

      session.setOptions({
        tabSize: settings.tabSize,
        useSoftTabs: settings.softTab,
      });
      file.setMode(mode);
    }
    file.session.setUseWrapMode(settings.textWrap);
  }

  function moveOpenFileList() {
    let $list;

    if ($openFileList) {
      if ($openFileList.classList.contains('collaspable')) {
        $list = [...$openFileList.$ul.children];
      } else {
        $list = [...$openFileList.children];
      }
      $openFileList.remove();
    }

    if (appSettings.value.openFileListPos === 'header') {
      $openFileList = tag('ul', {
        className: 'open-file-list',
        ontouchstart: checkForDrag,
        onmousedown: checkForDrag,
      });
      if ($list) $openFileList.append(...$list);
      root.append($openFileList);
      root.classList.add('top-bar');
    } else {
      $openFileList = list(strings['active files']);
      $openFileList.ontoggle = function () {
        openFolder.updateHeight();
      };
      if ($list) $openFileList.$ul.append(...$list);
      $sidebar.insertBefore($openFileList, $sidebar.firstElementChild);
      root.classList.remove('top-bar');
    }
  }

  /**
   * @this {HTMLElement}
   * @param {MouseEvent|TouchEvent} e
   */
  function checkForDrag(e) {
    /**@type {HTMLElement} */
    const $el = e.target;
    if (!$el.classList.contains('tile')) return;

    const $parent = this;
    const type = e.type === 'mousedown' ? 'mousemove' : 'touchmove';
    const opts = {
      passive: false,
    };
    let timeout;

    if ($el.eventAdded) return;
    $el.eventAdded = true;

    timeout = setTimeout(() => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const event = (e) => (e.touches && e.touches[0]) || e;

      let startX = event(e).clientX;
      let startY = event(e).clientY;
      let prevEnd = startX;
      let position;
      let left = $el.offsetLeft;
      let $placeholder = $el.cloneNode(true);
      let classFlag = false;

      $placeholder.style.opacity = '0';
      if (appSettings.value.vibrateOnTap)
        navigator.vibrate(constants.VIBRATION_TIME);
      document.ontouchmove = document.onmousemove = null;
      document.addEventListener(type, drag, opts);

      document.ontouchend =
        document.onmouseup =
        document.ontouchcancel =
        document.onmouseleave =
          function (e) {
            $el.classList.remove('select');
            $el.style.removeProperty('transform');
            document.removeEventListener(type, drag, opts);
            document.ontouchend = document.onmouseup = null;
            if ($placeholder.isConnected) {
              $parent.replaceChild($el, $placeholder);
              updateFileList();
            }
            $el.eventAdded = false;
            document.ontouchend =
              document.onmouseup =
              document.ontouchcancel =
              document.onmouseleave =
                null;
          };

      function drag(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const end = event(e).clientX;

        position = prevEnd - end > 0 ? 'l' : 'r';
        prevEnd = end;
        const move = end - startX;
        const $newEl = document.elementFromPoint(end, startY);

        $el.style.transform = `translate3d(${left + move}px, 0, 0)`;
        if (!classFlag) {
          $el.classList.add('select');
          $parent.insertBefore($placeholder, $el);
          classFlag = true;
        }
        if (
          $newEl.classList.contains('tile') &&
          $el !== $newEl &&
          $parent.contains($newEl)
        ) {
          if (position === 'r') {
            if ($newEl.nextElementSibling) {
              $parent.insertBefore($placeholder, $newEl.nextElementSibling);
            } else {
              $parent.append($placeholder);
            }
          } else {
            $parent.insertBefore($placeholder, $newEl);
          }
        }
      }
    }, 300);

    document.ontouchend =
      document.onmouseup =
      document.ontouchmove =
      document.onmousemove =
        function (e) {
          document.ontouchend =
            document.onmouseup =
            document.ontouchmove =
            document.onmousemove =
              null;
          if (timeout) clearTimeout(timeout);
          $el.eventAdded = false;
        };

    function updateFileList() {
      const children = [...$parent.children];
      const newFileList = [];
      for (let el of children) {
        for (let file of manager.files) {
          if (file.assocTile === el) {
            newFileList.push(file);
            break;
          }
        }
      }

      manager.files = newFileList;
    }
  }

  function hasUnsavedFiles() {
    let count = 0;
    for (let editor of manager.files) {
      if (editor.isUnsaved) ++count;
    }

    return count;
  }

  function removeFile(id, force) {
    /**
     * @type {File}
     */
    const file = typeof id === 'string' ? getFile(id, 'id') : id;

    if (!file) return;

    if (file.isUnsaved && !force) {
      dialogs
        .confirm(strings.warning.toUpperCase(), strings['unsaved file'])
        .then(closeFile);
    } else {
      closeFile();

      if (file.type === 'git') gitRecord.remove(file.record.sha);
      else if (file.type === 'gist') gistRecord.remove(file.record);
    }

    function closeFile() {
      manager.files = manager.files.filter((editor) => editor.id !== file.id);

      if (!manager.files.length) {
        editor.setSession(new ace.EditSession(''));
        $sidebar.hide();
        addNewFile();
      } else {
        if (file.id === manager.activeFile.id) {
          switchFile(manager.files[manager.files.length - 1].id);
        }
      }

      file.removeCacheFile();
      file.session.off('changeScrollTop', onscrolltop);
      if (!appSettings.value.textWrap)
        file.session.off('changeScrollLeft', onscrollleft);

      file.assocTile.remove();
      file.session.destroy();
      delete file.session;
      delete file.assocTile;
      manager.onupdate('remove-file');
    }
  }

  /**
   *
   * @param {string|number|Repo|Gist} checkFor
   * @param {"id"|"name"|"uri"|"git"|"gist"} [type]
   * @returns {File}
   */
  function getFile(checkFor, type = 'id') {
    if (typeof type !== 'string') return null;

    let result = null;
    for (let file of manager.files) {
      if (typeof type === 'string') {
        if (type === 'id' && file.id === checkFor) result = file;
        else if (type === 'name' && file.name === checkFor) result = file;
        else if (type === 'uri' && file.uri === checkFor) result = file;
        else if (
          type === 'gist' &&
          file.record &&
          file.record.id === checkFor.id
        )
          result = file;
        else if (
          type === 'git' &&
          file.record &&
          file.record.sha === checkFor.sha
        )
          result = file;
      }
      if (result) break;
    }

    return result;
  }

  return manager;
}

export default EditorManager;
