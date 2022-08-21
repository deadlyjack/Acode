import list from '../components/collapsableList';
import tag from 'html-tag-js';
import dialogs from '../components/dialogs';
import helpers from '../utils/helpers';
import constants from './constants';
import openFolder from './openFolder';
import ScrollBar from '../components/scrollbar/scrollbar';
import Commands from '../ace/commands';
import touchListeners from '../ace/touchHandler';
import editorFile from './editorFile';

//TODO: Add option to work multiple files at same time in large display.

/**
 *
 * @param {HTMLElement} $sidebar
 * @param {HTMLElement} $header
 * @param {HTMLElement} $body
 * @returns {Promise<Manager>}
 */
async function EditorManager($sidebar, $header, $body) {
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
  let timeoutQuicktoolToggler;
  let timeoutHeaderToggler;
  let autosaveTimeout;
  const { scrollbarSize, editorFont } = appSettings.value;
  const events = {
    'switch-file': [],
    'rename-file': [],
    'save-file': [],
    'file-content-changed': [],
    'update': [],
    emit(event, ...args) {
      if (!events[event]) return;
      events[event].forEach((fn) => fn(...args));
    }
  };
  const $container = tag('div', {
    className: `editor-container ${editorFont}`,
  });
  /**
   * @type {AceAjax.Editor}
   */
  const editor = ace.edit($container);
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
    placement: 'bottom',
  });
  /**@type {Manager}*/
  const manager = {
    editor,
    addNewFile: editorFile,
    getFile,
    switchFile,
    activeFile: null,
    onupdate: () => { },
    hasUnsavedFiles,
    files: [],
    removeFile,
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
    on(event, callback) {
      if (!events[event]) return;
      events[event].push(callback);
    },
    off(event, callback) {
      if (!events[event]) return;
      events[event] = events[event].filter(c => c !== callback);
    },
    emit(event, ...args) {
      events.emit(event, ...args);
    }
  };

  moveOpenFileList();
  $body.appendChild($container);
  await setupEditor();

  $hScrollbar.onshow = $vScrollbar.onshow = updateFloatingButton.bind({}, false);
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
    checkTimeout = setTimeout(async () => {
      const { activeFile } = manager;
      if (activeFile.markChanged) {
        const changed = await activeFile.isChanged();
        activeFile.isUnsaved = changed;
        activeFile.writeToCache();
        events.emit('file-content-changed', activeFile);
        manager.onupdate('file-changed');
        manager.emit('update', 'file-changed');

        if (changed) {
          if (autosaveTimeout) clearTimeout(autosaveTimeout);
          autosaveTimeout = setTimeout(() => {
            acode.exec('save', false);
          }, appSettings.value.autosave);
        }
      }
      activeFile.markChanged = true;
    }, TIMEOUT_VALUE);
  });

  editor.on('scrolltop', onscrolltop);
  editor.on('scrollleft', onscrollleft);

  appSettings.on('update:textWrap', function (value) {
    if (!value) {
      editor.renderer.setScrollMargin(0, 0, 0, appSettings.value.leftMargin);
    } else {
      editor.renderer.setScrollMargin(0, 0, 0, 0);
    }

    for (let file of manager.files) {
      file.session.setUseWrapMode(value);
      if (!value) file.session.on('changeScrollLeft', onscrollleft);
      else file.session.off('changeScrollLeft', onscrollleft);
    }
  });

  appSettings.on('update:tabSize', function (value) {
    manager.files.forEach((file) => file.session.setTabSize(value));
  });

  appSettings.on('update:softTab', function (value) {
    manager.files.forEach((file) => file.session.setUseSoftTabs(value));
  });

  appSettings.on('update:showSpaces', function (value) {
    editor.setOption('showInvisibles', value);
  });

  appSettings.on('update:editorFont', function (value) {
    $container.classList.remove(appSettings.value.editorFont);
    $container.classList.add(value);
  });

  appSettings.on('update:fontSize', function (value) {
    editor.setFontSize(value);
  });

  appSettings.on('update:openFileListPos', function (value) {
    moveOpenFileList();
    $vScrollbar.resize();
  });

  appSettings.on('update:showPrintMargin', function (value) {
    editorManager.editor.setOption('showPrintMargin', value);
  });

  appSettings.on('update:scrollbarSize', function (value) {
    $vScrollbar.size = value;
    $hScrollbar.size = value;
  });

  appSettings.on('update:liveAutoCompletion', function (value) {
    editor.setOption('enableLiveAutocompletion', value);
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
    const editorHeight = helpers.getEditorHeight(editor);
    const scroll = editorHeight * value;

    session.setScrollTop(scroll);
    editor._emit('scroll', editor);
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
    const editorWidth = helpers.getEditorWidth(editor);
    const scroll = editorWidth * value;

    session.setScrollLeft(scroll);
    editor._emit('scroll', editor);
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
    const editorWidth = helpers.getEditorWidth(editor);
    const factor = (session.getScrollLeft() / editorWidth).toFixed(2);

    $hScrollbar.value = factor;
    if (render) $hScrollbar.render();
    editor._emit('scroll', 'horizontal');
  }

  /**
   * Callback function called on scroll vertically
   * @param {Boolean} render
   */
  function onscrolltop(render = true) {
    if (preventScrollbarV) return;
    const session = editor.getSession();
    const editorHeight = helpers.getEditorHeight(editor);
    const factor = (session.getScrollTop() / editorHeight).toFixed(2);

    $vScrollbar.value = factor;
    if (render) $vScrollbar.render();
    editor._emit('scroll', 'verticle');
  }

  function updateFloatingButton(show = false) {
    const { $quickToolToggler, $headerToggler } = acode;

    if (show) {
      if (scrollBarVisiblityCount) --scrollBarVisiblityCount;

      if (!scrollBarVisiblityCount) {
        clearTimeout(timeoutHeaderToggler);
        clearTimeout(timeoutQuicktoolToggler);

        if (appSettings.value.floatingButton) {
          $quickToolToggler.classList.remove('hide');
          root.appendOuter($quickToolToggler);
        }

        $headerToggler.classList.remove('hide');
        root.appendOuter($headerToggler);
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
   * @param {File} file
   */
  function setSubText(file) {
    let text = file.location || file.uri;

    if (file.type === 'git') {
      text = 'git • ' + file.record.repo + '/' + file.record.path;
    } else if (file.type === 'gist') {
      const id = file.record.id;
      text = `gist • ${id.length > 10 ? '...' + id.substring(id.length - 7) : id
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

        manager.activeFile = file;
        editor.setSession(file.session);

        if (manager.state === 'focus') editor.focus();
        $header.text = file.filename;
        setSubText(file);
        file.assocTile.classList.add('active');
        file.assocTile.scrollIntoView();

        $hScrollbar.remove();
        $vScrollbar.remove();
        onscrolltop(false);
        if (!appSettings.value.textWrap) onscrollleft(false);
        editor.setReadOnly(!file.editable || !!file.loading);

        manager.onupdate('switch-file');
        events.emit('switch-file', file);
        return;
      }
    }

    manager.onupdate('switch-file');
  }

  async function setupEditor() {
    const Emmet = ace.require('ace/ext/emmet');
    const settings = appSettings.value;
    const commands = await Commands();

    touchListeners(editor);
    Emmet.setCore(window.emmet);
    commands.forEach((command) => {
      editor.commands.addCommand(command);
    });
    editor.setFontSize(settings.fontSize);
    editor.setHighlightSelectedWord(true);
    editor.container.style.lineHeight = settings.lineHeight;
    editor.textInput.onContextMenu = (e) => {
      e.preventDefault();
    };

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

    if (!appSettings.value.textWrap) {
      editor.renderer.setScrollMargin(0, 0, 0, settings.leftMargin);
    }

    if (appSettings.value.linenumbers) {
      editor.renderer.setMargin(0, 0, -16, 0);
    }
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
      root.appendOuter($openFileList);
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

      $placeholder.style.opacity = '0';
      if (appSettings.value.vibrateOnTap) {
        navigator.vibrate(constants.VIBRATION_TIME);
        $el.classList.add('select');
        $el.style.transform = `translate3d(${left}px, 0, 0)`;
        $parent.insertBefore($placeholder, $el);
      }
      document.addEventListener(type, drag, opts);
      document.ontouchmove = null;
      document.onmousemove = null;
      document.ontouchend = cancelDrag;
      document.onmouseup = cancelDrag;
      document.ontouchcancel = cancelDrag;
      document.onmouseleave = cancelDrag;

      function cancelDrag() {
        $el.classList.remove('select');
        $el.style.removeProperty('transform');
        document.removeEventListener(type, drag, opts);
        document.ontouchend = document.onmouseup = null;
        if ($placeholder.isConnected) {
          $parent.replaceChild($el, $placeholder);
          updateFileList();
        }
        $el.eventAdded = false;
        document.ontouchend = null;
        document.onmouseup = null;
        document.ontouchcancel = null;
        document.onmouseleave = null;
      }

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
        manager.addNewFile();
      } else {
        if (file.id === manager.activeFile.id) {
          switchFile(manager.files[manager.files.length - 1].id);
        }
      }

      file.destroy();
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
