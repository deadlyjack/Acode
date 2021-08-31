import tag from 'html-tag-js';
/**
 *
 * @param {AceAjax.Editor} editor
 * @param {Object} controls
 * @param {HTMLElement} container
 */
function textControl(editor, container) {
  const $content = container.querySelector('.ace_scroller'),
    threshold = 200;

  let counterTimeout,
    oldPos = editor.getCursorPosition(),
    count = 0,
    touch = false,
    cmFlag = false,
    move = false;

  const clearDoubleclick = () => {
    count = 0;
    if (clearTimeout) clearTimeout(counterTimeout);
    counterTimeout = null;
  };

  $content.addEventListener('touchstart', ontouchstart);
  $content.addEventListener('touchmove', ontouchmove);
  $content.addEventListener('touchcancel', ontouchmove);
  $content.addEventListener('touchend', ontouchend);
  $content.addEventListener('click', onclick);
  $content.addEventListener('contextmenu', oncontextmenu);

  function onclick(e) {
    const shiftKey = tag.get('#shift-key');
    if (shiftKey && shiftKey.getAttribute('data-state') === 'on') {
      const me = new AceMouseEvent(e, editor);
      const pos = me.getDocumentPosition();
      editor.selection.setRange({
        start: oldPos,
        end: pos,
      });
      Acode.exec('select-word');
    } else {
      if (!editor.isFocused()) editor.focus();

      oldPos = editor.getCursorPosition();
    }

    enableSingleMode();
  }

  function ontouchstart(e) {
    const shiftKey = tag.get('#shift-key');
    if (shiftKey && shiftKey.getAttribute('data-state') === 'on') return;
    if (count) preventDefault(e);

    move = false;
    touch = true;

    if (cmFlag) {
      count = 0;
      cmFlag = false;
      return;
    }
  }

  function ontouchmove(e) {
    if (!touch) return;
    move = true;
    clearDoubleclick();
  }

  function ontouchend(e) {
    if (!touch || move) return;

    if (count++) {
      clearDoubleclick();
      setTimeout(() => {
        if (touch) return;
        setTimeout(Acode.exec, 0, 'select-word');
        editor.focus();
      }, 0);
    }
    touch = false;
    counterTimeout = setTimeout(clearDoubleclick, threshold);
  }

  function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function oncontextmenu(e) {
    preventDefault(e);
    const ev = new AceMouseEvent(e, editor);
    const pos = ev.getDocumentPosition();
    editor.gotoLine(parseInt(pos.row + 1), parseInt(pos.column + 1));
    cmFlag = true;

    Acode.exec('select-word');
    editor.focus();

    document.ontouchend = function () {
      count = 0;
      cmFlag = false;
    };
  }
}

function enableSingleMode() {
  const { editor, controls, container } = editorManager;
  const containerClient = container.getBoundingClientRect();
  const margin = {
    left: 0,
    top: 0,
  };

  if (controls.size === 'large') {
    margin.left = '-17.5px';
    margin.top = '7px';
  } else if (controls.size === 'small') {
    margin.left = '-12.5px';
    margin.top = '4px';
  } else return;

  const selectedText = editor.getCopyText();
  if (selectedText) return;
  const $cursor = editor.container.querySelector(
    '.ace_cursor-layer>.ace_cursor'
  );
  const $cm = controls.menu;
  const lineHeight = editor.renderer.lineHeight;
  const lessConent = `<span action="select">${strings.select}</span>${
    editor.getReadOnly() ? '' : `<span action="paste">${strings.paste}</span>`
  }<span action="select all">${strings['select all']}<span>`;
  const $end = controls.end;
  let updateTimeout;

  const cpos = {
    x: 0,
    y: 0,
  };

  if (controls.callBeforeContextMenu) controls.callBeforeContextMenu();
  $cm.innerHTML = lessConent;
  if (editorManager.activeFile) editorManager.activeFile.controls = true;
  controls.update = updateEnd;
  controls.callBeforeContextMenu = callBeforeContextMenu;

  $end.style.marginLeft = margin.left;
  $end.style.marginTop = margin.top;

  editor.on('blur', hide);
  editor.session.on('changeScrollTop', hide);
  editor.session.on('changeScrollLeft', hide);
  editor.selection.on('changeCursor', onchange);
  controls.checkForColor();

  updateEnd();

  const mObserver = new MutationObserver(oberser);

  mObserver.observe($cursor, {
    attributeFilter: ['style'],
    attributes: true,
  });

  if (!$end.isConnected) container.append($end);
  $end.ontouchstart = function (e) {
    touchStart.call(this, e);
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  function touchStart() {
    const el = this;
    let showCm = $cm.isConnected;
    let move = false;

    document.ontouchmove = function (e) {
      e.clientY = e.touches[0].clientY - 28;
      e.clientX = e.touches[0].clientX;
      const ev = new AceMouseEvent(e, editor);
      const pos = ev.getDocumentPosition();

      editor.selection.moveCursorToPosition(pos);
      editor.selection.setSelectionAnchor(pos.row, pos.column);
      editor.renderer.scrollCursorIntoView(pos);
      if (showCm) $cm.remove();
      move = true;
    };
    document.ontouchend = function () {
      document.ontouchmove = null;
      document.ontouchend = null;
      el.touchStart = null;
      if (showCm) {
        showContextMenu();
      } else if (!move) {
        container.appendChild($cm);
        controls.checkForColor();
        updateCm();
      }
    };
  }

  function showContextMenu() {
    if (editor.getCopyText()) {
      $cm.innerHTML =
        controlscontrols[
          editor.getReadOnly() ? 'readOnlyContent' : 'fullContent'
        ];
    } else {
      $cm.innerHTML = lessConent;
    }
    container.appendChild($cm);
    updateCm();
  }

  function onchange() {
    updateTimeout = setTimeout(updateEnd, 0);
  }

  function updateEnd() {
    if (!editorManager.activeFile.controls) return $end.remove();
    const cursor = $cursor.getBoundingClientRect();

    cpos.x = cursor.left + 1;
    cpos.y = cursor.bottom;

    update();
  }

  function update(left = 0, top = 0) {
    const offset = parseFloat(root.style.marginLeft) || 0;
    $end.style.transform = `translate3d(${cpos.x + 2 + left - offset}px, ${
      cpos.y + top
    }px, 0) rotate(45deg)`;
    $end.style.display = 'block';
  }

  function updateCm() {
    const offset = parseFloat(root.style.marginLeft) || 0;
    const cm = {
      left: cpos.x - offset,
      top: cpos.y - (40 + lineHeight),
    };

    let scale = 1;

    $cm.style.transform = `translate3d(${cm.left}px, ${cm.top}px, 0) scale(${scale})`;

    const cmClient = $cm.getBoundingClientRect();

    if (cmClient.right + 10 > innerWidth) {
      cm.left = (innerWidth - cmClient.width * scale) / 2;
    }

    if (cmClient.left < 10) {
      cm.left = 10;
    }

    if (cmClient.top < containerClient.top) {
      cm.top += 80;
    }

    $cm.style.transform = `translate3d(${cm.left * scale}px, ${
      cm.top
    }px, 0) scale(${scale})`;
  }

  function callBeforeContextMenu() {
    $end.remove();
    $cm.remove();

    $end.style.removeProperty('margin-left');
    $end.style.removeProperty('margin-top');

    $cm.innerHTML =
      controls[editor.getReadOnly() ? 'readOnlyContent' : 'fullContent'];
    editor.session.off('changeScrollTop', hide);
    editor.session.off('changeScrollLeft', hide);
    editor.selection.off('changeCursor', onchange);
    editor.off('blur', hide);
    mObserver.disconnect();
    $end.ontouchstart = null;
  }

  function hide() {
    if ($end.isConnected) $end.remove();
    if ($cm.isConnected) $cm.remove();
  }

  function oberser() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateEnd();
  }

  return {
    hide,
    update,
    updateCm,
    showContextMenu,
    callBeforeContextMenu,
  };
}

textControl.enableSingleMode = enableSingleMode;

export default textControl;
