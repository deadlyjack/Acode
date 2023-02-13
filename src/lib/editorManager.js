import list from '../components/collapsableList';
import helpers from '../utils/helpers';
import openFolder from './openFolder';
import ScrollBar from '../components/scrollbar/scrollbar';
import Commands from '../ace/commands';
import touchListeners from '../ace/touchHandler';
import appSettings from './settings';
import EditorFile from './editorFile';
import { $quickToolToggler } from '../handlers/quickTools';

//TODO: Add option to work multiple files at same time in large display.

/**
 *
 * @param {HTMLElement} $sidebar
 * @param {HTMLElement} $header
 * @param {HTMLElement} $body
 */
async function EditorManager($sidebar, $header, $body) {
  /**
   * @type {Collaspable & HTMLElement}
   */
  let $openFileList;
  let TIMEOUT_VALUE = 500;
  let heightOffset = Math.round(screen.height - innerHeight);
  let preventScrollbarV = false;
  let preventScrollbarH = false;
  let scrollBarVisiblityCount = 0;
  let timeoutQuicktoolToggler;
  let timeoutHeaderToggler;
  const { scrollbarSize, editorFont } = appSettings.value;
  const events = {
    'switch-file': [],
    'rename-file': [],
    'save-file': [],
    'file-loaded': [],
    'file-content-changed': [],
    'update': [],
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
    onscrollend: onscrollHend,
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
    moveOpenFileList,
    header: $header,
    sidebar: $sidebar,
    container: $container,
    get openFileList() {
      return $openFileList;
    },
    get TIMEOUT_VALUE() {
      return TIMEOUT_VALUE;
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

  setFont(editorFont);
  moveOpenFileList();
  $body.appendChild($container);
  await setupEditor();

  $hScrollbar.onshow = $vScrollbar.onshow = updateFloatingButton.bind({}, false);
  $hScrollbar.onhide = $vScrollbar.onhide = updateFloatingButton.bind({}, true);

  window.addEventListener('resize', () => {
    const { activeFile } = manager;
    const screenHeight = screen.height - heightOffset;
    const ratio = Math.round((screenHeight / innerHeight) * 10) / 10;
    if (ratio === 1 && activeFile.focusedBefore) {
      editor.blur();
      activeFile.focused = false;
      activeFile.focusedBefore = false;
    } else {
      activeFile.focusedBefore = activeFile.focused;
    }
    editor.renderer.scrollCursorIntoView();
  });

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
    setFont(value);
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

  return manager;

  /**
   * 
   * @param {EditorFile} file 
   */
  function addFile(file) {
    if (manager.files.includes(file)) return;
    manager.files.push(file);
    $openFileList.append(file.tab);
    $header.text = file.name;
  }

  async function setupEditor() {
    let checkTimeout = null;
    let autosaveTimeout;
    const Emmet = ace.require('ace/ext/emmet');
    const settings = appSettings.value;
    const commands = await Commands();

    editor.on('focus', () => {
      const { activeFile } = manager;
      activeFile.focused = true;
      $hScrollbar.hide();
      $vScrollbar.hide();
      // scroll active line into middle of screen
      editor.renderer.scrollCursorIntoView();
    });

    editor.on('change', function (e) {
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

    editor.on('scrolltop', onscrolltop);
    editor.on('scrollleft', onscrollleft);

    editor.renderer.on('resize', () => {
      $vScrollbar.resize($vScrollbar.visible);
      $hScrollbar.resize($hScrollbar.visible);
    });

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

    if (!appSettings.value.textWrap) {
      editor.renderer.setScrollMargin(0, 0, 0, settings.leftMargin);
    }

    if (appSettings.value.linenumbers) {
      editor.renderer.setMargin(0, 0, -16, 0);
    }
  }

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
    const { $headerToggler } = acode;

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

    // show open file list in header
    if (appSettings.value.openFileListPos === appSettings.OPEN_FILE_LIST_POS_HEADER) {
      $openFileList = <ul className='open-file-list'></ul>;
      if ($list) $openFileList.append(...$list);
      root.appendOuter($openFileList);
      root.classList.add('top-bar');

      const oldAppend = $openFileList.append;
      $openFileList.append = (...args) => {
        oldAppend.apply($openFileList, args);
      }
    } else {
      $openFileList = list(strings['active files']);
      $openFileList.ontoggle = function () {
        openFolder.updateHeight();
      };
      if ($list) $openFileList.$ul.append(...$list);
      $sidebar.insertBefore($openFileList, $sidebar.firstElementChild);
      root.classList.remove('top-bar');

      const oldAppend = $openFileList.$ul.append;
      $openFileList.append = (...args) => {
        oldAppend.apply($openFileList.$ul, args);
        openFolder.updateHeight();
      }
    }
  }

  function hasUnsavedFiles() {
    const unsavedFiles = manager.files.filter((file) => file.isUnsaved);
    return unsavedFiles.length;
  }

  /**
   *
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

  function setFont(font) {
    let $style = tag.get("#font-style");
    if (!$style) {
      $style = <style id="font-style"></style>;
    }

    $style.textContent = `.editor-container.ace_editor{
  font-family: monotty, "${font}", NotoMono, Monaco, MONOSPACE !important;
}
.ace_text{
  font-family: inherit !important;
}`;
    $container.dataset.font = font;

    if (!$style.isConnected) {
      document.head.append($style);
    }
  }
}

export default EditorManager;
