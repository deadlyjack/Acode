import list from 'components/collapsableList';
import ScrollBar from 'components/scrollbar';
import touchListeners, { scrollAnimationFrame } from 'ace/touchHandler';
import appSettings from './settings';
import EditorFile from './editorFile';
import sidebarApps from 'sidebarApps';
import quickTools from 'components/quickTools';
import keyboardHandler from 'handlers/keyboard';
import initColorView from 'ace/colorView';
import { keydownState } from 'handlers/keyboard';
import { deactivateColorView } from 'ace/colorView';
import { setCommands, setKeyBindings } from 'ace/commands';
import { HARDKEYBOARDHIDDEN_NO, getSystemConfiguration } from './systemConfiguration';

//TODO: Add option to work multiple files at same time in large display.

/**
 *
 * @param {HTMLElement} $header
 * @param {HTMLElement} $body
 */
async function EditorManager($header, $body) {
  /**
   * @type {Collapsible & HTMLElement}
   */
  let $openFileList;
  let TIMEOUT_VALUE = 500;
  let preventScrollbarV = false;
  let preventScrollbarH = false;
  let scrollBarVisibilityCount = 0;
  let timeoutQuicktoolsToggler;
  let timeoutHeaderToggler;
  let isScrolling = false;
  let lastScrollTop = 0;
  let lastScrollLeft = 0;

  const { scrollbarSize } = appSettings.value;
  const events = {
    'switch-file': [],
    'rename-file': [],
    'save-file': [],
    'file-loaded': [],
    'file-content-changed': [],
    'add-folder': [],
    'remove-folder': [],
    'update': [],
    'new-file': [],
    'remove-file': [],
    'int-open-file-list': [],
    emit(event, ...args) {
      if (!events[event]) return;
      events[event].forEach((fn) => fn(...args));
    }
  };
  const $container = <div className='editor-container'></div>;
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
    onscrollend: onscrollHEnd,
    parent: $body,
    placement: 'bottom',
  });
  const manager = {
    files: [],
    onupdate: () => { },
    activeFile: null,
    addFile,
    editor,
    getFile,
    switchFile,
    hasUnsavedFiles,
    getEditorHeight,
    getEditorWidth,
    header: $header,
    container: $container,
    get isScrolling() {
      return isScrolling;
    },
    get openFileList() {
      if (!$openFileList) initFileTabContainer();
      return $openFileList;
    },
    get TIMEOUT_VALUE() {
      return TIMEOUT_VALUE;
    },
    on(types, callback) {
      if (!Array.isArray(types)) types = [types];
      types.forEach((type) => {
        if (!events[type]) events[type] = [];
        events[type].push(callback);
      });
    },
    off(types, callback) {
      if (!Array.isArray(types)) types = [types];
      types.forEach((type) => {
        if (!events[type]) return;
        events[type] = events[type].filter(c => c !== callback);
      });
    },
    emit(event, ...args) {
      let detailedEvent;
      let detailedEventArgs = args.slice(1);
      if (event === 'update') {
        const subEvent = args[0];
        if (subEvent) {
          detailedEvent = `${event}:${subEvent}`;
        }
      }
      events.emit(event, ...args);
      if (detailedEvent) {
        events.emit(detailedEvent, ...detailedEventArgs);
      }
    }
  };

  // set mode text
  editor.setSession(ace.createEditSession('', 'ace/mode/text'));
  $body.appendChild($container);
  await setupEditor();

  $hScrollbar.onshow = $vScrollbar.onshow = updateFloatingButton.bind({}, false);
  $hScrollbar.onhide = $vScrollbar.onhide = updateFloatingButton.bind({}, true);

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

  appSettings.on('update:fontSize', function (value) {
    editor.setFontSize(value);
  });

  appSettings.on('update:openFileListPos', function (value) {
    initFileTabContainer();
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

  appSettings.on('update:relativeLineNumbers', function (value) {
    editor.setOption('relativeLineNumbers', value);
  });

  appSettings.on('update:elasticTabstops', function (value) {
    editor.setOption('useElasticTabstops', value);
  });

  appSettings.on('update:rtlText', function (value) {
    editor.setOption('rtlText', value);
  });

  appSettings.on('update:hardWrap', function (value) {
    editor.setOption('hardWrap', value);
  });

  appSettings.on('update:printMargin', function (value) {
    editor.setOption('printMarginColumn', value);
  });

  appSettings.on('update:colorPreview', function (value) {
    if (value) {
      return initColorView(editor, true);
    }

    deactivateColorView();
  });

  return manager;

  /**
   * 
   * @param {EditorFile} file 
   */
  function addFile(file) {
    if (manager.files.includes(file)) return;
    manager.files.push(file);
    manager.openFileList.append(file.tab);
    $header.text = file.name;
  }

  async function setupEditor() {
    let checkTimeout = null;
    let autosaveTimeout;
    let scrollTimeout;

    const Emmet = ace.require('ace/ext/emmet');
    const settings = appSettings.value;
    const textInput = editor.textInput.getElement();

    editor.on('focus', async () => {
      const { activeFile } = manager;
      activeFile.focused = true;
      keyboardHandler.on('keyboardShow', scrollCursorIntoView);

      if (isScrolling) return;

      $hScrollbar.hide();
      $vScrollbar.hide();
    });

    editor.on('blur', async () => {
      const { hardKeyboardHidden, keyboardHeight } = await getSystemConfiguration();
      const blur = () => {
        const { activeFile } = manager;
        activeFile.focused = false;
        activeFile.focusedBefore = false;
      };

      if (hardKeyboardHidden === HARDKEYBOARDHIDDEN_NO && keyboardHeight < 100) { // external keyboard
        blur();
        return;
      }

      const onKeyboardHide = () => {
        keyboardHandler.off('keyboardHide', onKeyboardHide);
        blur();
      };

      keyboardHandler.on('keyboardHide', onKeyboardHide);
    });

    editor.on('change', (e) => {
      if (checkTimeout) clearTimeout(checkTimeout);
      if (autosaveTimeout) clearTimeout(autosaveTimeout);

      checkTimeout = setTimeout(async () => {
        const { activeFile } = manager;
        if (activeFile.markChanged) {
          const changed = await activeFile.isChanged();
          activeFile.isUnsaved = changed;
          activeFile.writeToCache();
          events.emit('file-content-changed', activeFile);
          manager.onupdate('file-changed');
          manager.emit('update', 'file-changed');

          const { autosave } = appSettings.value;
          if (activeFile.uri && changed && autosave) {
            autosaveTimeout = setTimeout(() => {
              acode.exec('save', false);
            }, autosave);
          }
        }
        activeFile.markChanged = true;
      }, TIMEOUT_VALUE);
    });

    editor.on('scroll', () => {
      clearTimeout(scrollTimeout);
      isScrolling = true;
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    });

    editor.renderer.on('resize', () => {
      $vScrollbar.resize($vScrollbar.visible);
      $hScrollbar.resize($hScrollbar.visible);
    });

    editor.on('scrolltop', onscrolltop);
    editor.on('scrollleft', onscrollleft);
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        keydownState.esc = { value: true, target: textInput };
      }
    });

    if (settings.colorPreview) {
      initColorView(editor);
    }

    touchListeners(editor);
    setCommands(editor);
    await setKeyBindings(editor);
    Emmet.setCore(window.emmet);
    editor.setFontSize(settings.fontSize);
    editor.setHighlightSelectedWord(true);
    editor.container.style.lineHeight = settings.lineHeight;

    ace.require('ace/ext/language_tools');
    editor.setOption('animatedScroll', false);
    editor.setOption('tooltipFollowsMouse', false);
    editor.setOption('theme', settings.editorTheme);
    editor.setOption('showGutter', settings.linenumbers);
    editor.setOption('showLineNumbers', settings.linenumbers);
    editor.setOption('enableEmmet', true);
    editor.setOption('showInvisibles', settings.showSpaces);
    editor.setOption('indentedSoftWrap', false);
    editor.setOption('scrollPastEnd', 0.5);
    editor.setOption('showPrintMargin', settings.showPrintMargin);
    editor.setOption('relativeLineNumbers', settings.relativeLineNumbers);
    editor.setOption('useElasticTabstops', settings.elasticTabstops);
    editor.setOption('useTextareaForIME', settings.useTextareaForIME);
    editor.setOption('rtlText', settings.rtlText);
    editor.setOption('hardWrap', settings.hardWrap);
    editor.setOption('spellCheck', settings.spellCheck);
    editor.setOption('printMarginColumn', settings.printMargin);
    editor.setOption('enableBasicAutocompletion', true);
    editor.setOption('enableLiveAutocompletion', settings.liveAutoCompletion);
    // editor.setOption('enableInlineAutocompletion', settings.inlineAutoCompletion);

    if (!appSettings.value.textWrap) {
      editor.renderer.setScrollMargin(0, 0, 0, settings.leftMargin);
    }

    if (appSettings.value.linenumbers) {
      editor.renderer.setMargin(0, 0, -16, 0);
    }
  }

  function scrollCursorIntoView() {
    keyboardHandler.off('keyboardShow', scrollCursorIntoView);
    if (isCursorVisible()) return;
    const { teardropSize } = appSettings.value;
    editor.renderer.scrollCursorIntoView();
    editor.renderer.scrollBy(0, teardropSize + 10);
    editor._emit('scroll-intoview');
  }

  /**
   * Checks if the cursor is visible within the Ace editor.
   * @returns {boolean} - True if the cursor is visible, false otherwise.
   */
  function isCursorVisible() {
    const { editor, container } = editorManager;
    const { teardropSize } = appSettings.value;
    const cursorPos = editor.getCursorPosition();
    const contentTop = container.getBoundingClientRect().top;
    const contentBottom = contentTop + container.clientHeight;
    const cursorTop = editor.renderer.textToScreenCoordinates(cursorPos.row, cursorPos.column).pageY;
    const cursorBottom = cursorTop + teardropSize + 10;
    return cursorTop >= contentTop && cursorBottom <= contentBottom;
  }

  /**
   * Callback function
   * @param {Number} value
   */
  function onscrollV(value) {
    preventScrollbarV = true;
    const session = editor.getSession();
    const editorHeight = getEditorHeight(editor);
    const scroll = editorHeight * value;

    session.setScrollTop(scroll);
    editor._emit('scroll', editor);
    cancelAnimationFrame(scrollAnimationFrame);
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
    const editorWidth = getEditorWidth(editor);
    const scroll = editorWidth * value;

    session.setScrollLeft(scroll);
    editor._emit('scroll', editor);
    cancelAnimationFrame(scrollAnimationFrame);
  }

  function onscrollHEnd() {
    preventScrollbarH = false;
  }

  /**
   * Callback function called on scroll vertically
   * @param {Boolean} render
   */
  function onscrollleft(render = true) {
    if (appSettings.value.textWrap || preventScrollbarH) return;
    const session = editor.getSession();
    const scrollLeft = session.getScrollLeft();

    if (scrollLeft === lastScrollLeft) return;

    const editorWidth = getEditorWidth(editor);
    const factor = (scrollLeft / editorWidth).toFixed(2);

    lastScrollLeft = scrollLeft;
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
    const scrollTop = session.getScrollTop();

    if (scrollTop === lastScrollTop) return;

    const editorHeight = getEditorHeight(editor);
    const factor = (scrollTop / editorHeight).toFixed(2);

    lastScrollTop = scrollTop;
    $vScrollbar.value = factor;
    if (render) $vScrollbar.render();
    editor._emit('scroll', 'vertical');
  }

  function updateFloatingButton(show = false) {
    const { $headerToggler } = acode;
    const { $toggler } = quickTools;

    if (show) {
      if (scrollBarVisibilityCount) --scrollBarVisibilityCount;

      if (!scrollBarVisibilityCount) {
        clearTimeout(timeoutHeaderToggler);
        clearTimeout(timeoutQuicktoolsToggler);

        if (appSettings.value.floatingButton) {
          $toggler.classList.remove('hide');
          root.appendOuter($toggler);
        }

        $headerToggler.classList.remove('hide');
        root.appendOuter($headerToggler);
      }
    } else {
      if (!scrollBarVisibilityCount) {
        if ($toggler.isConnected) {
          $toggler.classList.add('hide');
          timeoutQuicktoolsToggler = setTimeout(
            () => $toggler.remove(),
            300,
          );
        }
        if ($headerToggler.isConnected) {
          $headerToggler.classList.add('hide');
          timeoutHeaderToggler = setTimeout(() => $headerToggler.remove(), 300);
        }
      }

      ++scrollBarVisibilityCount;
    }
  }

  function switchFile(id) {
    const { id: activeFileId } = manager.activeFile || {};
    if (activeFileId === id) return;

    const file = manager.getFile(id);

    manager.activeFile?.tab.classList.remove('active');
    manager.activeFile = file;
    editor.setSession(file.session);
    $header.text = file.filename;

    $hScrollbar.remove();
    $vScrollbar.remove();
    onscrolltop(false);
    if (!appSettings.value.textWrap) onscrollleft(false);
    editor.setReadOnly(!file.editable || !!file.loading);

    manager.onupdate('switch-file');
    events.emit('switch-file', file);
  }

  function initFileTabContainer() {
    let $list;

    if ($openFileList) {
      if ($openFileList.classList.contains('collapsible')) {
        $list = Array.from($openFileList.$ul.children);
      } else {
        $list = Array.from($openFileList.children);
      }
      $openFileList.remove();
    }

    // show open file list in header
    const { openFileListPos } = appSettings.value;
    if (
      openFileListPos === appSettings.OPEN_FILE_LIST_POS_HEADER ||
      openFileListPos === appSettings.OPEN_FILE_LIST_POS_BOTTOM
    ) {
      if (!$openFileList?.classList.contains('open-file-list')) {
        $openFileList = <ul className='open-file-list'></ul>;
      }
      if ($list) $openFileList.append(...$list);

      if (openFileListPos === appSettings.OPEN_FILE_LIST_POS_BOTTOM) {
        $container.parentElement.insertAdjacentElement('afterend', $openFileList);
      } else {
        $header.insertAdjacentElement('afterend', $openFileList);
      }

      root.classList.add('top-bar');

      const oldAppend = $openFileList.append;
      $openFileList.append = (...args) => {
        oldAppend.apply($openFileList, args);
      };
    } else {
      $openFileList = list(strings['active files']);
      $openFileList.classList.add('file-list');
      if ($list) $openFileList.$ul.append(...$list);
      $openFileList.expand();

      const oldAppend = $openFileList.$ul.append;
      $openFileList.append = (...args) => {
        oldAppend.apply($openFileList.$ul, args);
      };

      const files = sidebarApps.get('files');
      files.insertBefore($openFileList, files.firstElementChild);
      root.classList.remove('top-bar');
    }

    root.setAttribute('open-file-list-pos', openFileListPos);
    manager.emit('int-open-file-list', openFileListPos);
  }

  function hasUnsavedFiles() {
    const unsavedFiles = manager.files.filter((file) => file.isUnsaved);
    return unsavedFiles.length;
  }

  /**
   * Gets a file from the file manager
   * @param {string|number} checkFor
   * @param {"id"|"name"|"uri"} [type]
   * @returns {File}
   */
  function getFile(checkFor, type = 'id') {
    return manager.files.find((file) => {
      switch (type) {
        case 'id':
          if (file.id === checkFor) return true;
          return false;
        case 'name':
          if (file.filename === checkFor) return true;
          return false;
        case 'uri':
          if (file.uri === checkFor) return true;
          return false;
        default:
          return false;
      }
    });
  }

  /**
   * Gets the height of the editor
   * @param {AceAjax.Editor} editor 
   * @returns 
   */
  function getEditorHeight(editor) {
    const { renderer, session } = editor;
    const offset = (renderer.$size.scrollerHeight + renderer.lineHeight) * 0.5;
    const editorHeight = session.getScreenLength() * renderer.lineHeight - offset;
    return editorHeight;
  }

  /**
   * Gets the height of the editor
   * @param {AceAjax.Editor} editor 
   * @returns 
   */
  function getEditorWidth(editor) {
    const { renderer, session } = editor;
    const offset = renderer.$size.scrollerWidth - renderer.characterWidth;
    const editorWidth = session.getScreenWidth() * renderer.characterWidth - offset;
    if (appSettings.value.textWrap) {
      return editorWidth;
    } else {
      return editorWidth + appSettings.value.leftMargin;
    }
  }
}

export default EditorManager;
