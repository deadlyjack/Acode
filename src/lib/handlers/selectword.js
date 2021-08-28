import textControl from './selection';
import constants from '../constants';

//TODO: Text control start has bug.

/**
 *
 * @param {"word"} type
 */
function select(type) {
  type = type || 'word';

  const { editor, controls, container } = editorManager;
  const containerClient = container.getBoundingClientRect();
  let marginLeft;
  let disabled = false;

  if (controls.size === 'large') marginLeft = '-30.5px';
  else if (controls.size === 'small') marginLeft = '-21.5px';
  else return;

  const $content = container.querySelector('.ace_scroller');
  const lineHeight = editor.renderer.lineHeight;
  const $cm = controls.menu;
  const $cursor = editor.container.querySelector(
    '.ace_cursor-layer>.ace_cursor'
  );
  const $start = controls.start;
  const $end = controls.end;
  const initialScroll = {
    top: 0,
    left: 0,
  };
  let cpos = {
    start: {
      x: 0,
      y: 0,
    },
    end: {
      x: 0,
      y: 0,
    },
  };

  if (!editor.getCopyText() && type === 'word')
    editor.selectMore(1, false, true);
  if (!editor.getCopyText())
    return textControl.enableSingleMode().showContextMenu();

  if (controls.callBeforeContextMenu) controls.callBeforeContextMenu();

  $end.style.marginLeft = '-4px';
  $end.style.marginTop = '0px';

  $start.style.marginLeft = marginLeft;
  $start.style.marginTop = '0px';

  controls.update = updateControls;
  controls.callBeforeContextMenu = disable;
  $end.onclick = null;
  $content.addEventListener('click', disable);
  editor.session.on('changeScrollTop', updatePosition);
  editor.session.on('changeScrollLeft', updatePosition);
  editor.selection.on('changeCursor', onchange);
  controls.checkForColor();

  editor.textInput.getElement().oninput = disable;

  $start.ontouchstart = function (e) {
    touchStart.call(this, e, 'start');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  $end.ontouchstart = function (e) {
    touchStart.call(this, e, 'end');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  setTimeout(() => {
    container.append($start, $end, $cm);
    if (appSettings.value.vibrateOnTap)
      navigator.vibrate(constants.VIBRATION_TIME);
    updateControls();

    const offset =
      $end.getBoundingClientRect().bottom -
      container.getBoundingClientRect().bottom;
    if (offset > 0) {
      editor.renderer.scrollBy(0, offset);
    }
  }, 100);

  function touchStart(e, action) {
    if (disabled) return;

    $cm.remove();
    const el = this;

    document.ontouchmove = function (e) {
      e.clientY = e.touches[0].clientY - 28;
      e.clientX = e.touches[0].clientX;
      const ev = new AceMouseEvent(e, editor);
      const pos = ev.getDocumentPosition();
      const range = editor.selection.getRange();

      if (action === 'start') {
        if (pos.row > range.end.row && pos.column >= range.end.column)
          pos.column = range.end.column - 1;
        if (pos.row > range.end.row) pos.row = range.end.row;
        editor.selection.setSelectionAnchor(pos.row, pos.column);
      } else {
        if (pos.row < range.start.row && pos.column <= range.start.column)
          pos.column = range.start.column + 1;
        if (pos.row < range.start.row) pos.row = range.start.row;
        editor.selection.moveCursorToPosition(pos);
      }

      editor.renderer.scrollCursorIntoView(pos);
      if (action === 'start') {
        updateControls(action);
      }
    };

    document.ontouchend = function () {
      container.appendChild($cm);
      updateControls(action);
      document.ontouchmove = null;
      document.ontouchend = null;
      el.touchStart = null;
    };
  }

  function updatePosition() {
    if (disabled) return;

    const scrollTop = editor.renderer.getScrollTop() - initialScroll.top;
    const scrollLeft = editor.renderer.getScrollLeft() - initialScroll.left;

    update(-scrollLeft, -scrollTop);
  }

  function onchange() {
    if (disabled) return;

    setTimeout(() => {
      updateControls('end');
      updateControls('start');
    }, 0);
  }

  function updateControls(mode) {
    if (disabled) return;

    const selected = editor.getCopyText();
    if (!selected) {
      return disable();
    }

    const $singleMode = editor.container.querySelector(
      '.ace_marker-layer>.ace_selection.ace_br15'
    );
    const cursor = $cursor.getBoundingClientRect();
    const scrollTop = editor.renderer.getScrollTop();
    const scrollLeft = editor.renderer.getScrollLeft();

    if ($singleMode) {
      const singleMode = $singleMode.getBoundingClientRect();

      if (mode && typeof mode === 'string') {
        if (mode === 'start') {
          cpos.start.x = singleMode.left;
          cpos.start.y = singleMode.bottom;
          cpos.end.x -= scrollLeft - initialScroll.left;
          cpos.end.y -= scrollTop - initialScroll.top;
        } else {
          cpos.start.x -= scrollLeft - initialScroll.left;
          cpos.start.y -= scrollTop - initialScroll.top;
          cpos.end.x = singleMode.right;
          cpos.end.y = singleMode.bottom;
        }
      } else {
        cpos.start.x = singleMode.left;
        cpos.end.x = singleMode.right;
        cpos.end.y = singleMode.bottom;
        cpos.start.y = singleMode.bottom;
      }
    } else {
      const $clientStart = editor.container.querySelector(
        '.ace_marker-layer>.ace_selection.ace_br1.ace_start'
      );
      const $clientEnd = editor.container.querySelector(
        '.ace_marker-layer>.ace_selection.ace_br12'
      );

      if ($clientStart && $clientEnd) {
        const clientStart = $clientStart.getBoundingClientRect();
        const clientEnd = $clientEnd.getBoundingClientRect();

        if (mode && typeof mode === 'string') {
          if (mode === 'start') {
            cpos.start.x = clientStart.left;
            cpos.start.y = clientStart.bottom;
            cpos.end.x -= scrollLeft - initialScroll.left;
            cpos.end.y -= scrollTop - initialScroll.top;
          } else {
            cpos.start.x -= scrollLeft - initialScroll.left;
            cpos.start.y -= scrollTop - initialScroll.top;
            cpos.end.x = clientEnd.right;
            cpos.end.y = clientEnd.bottom;
          }
        } else {
          cpos.start.x = clientStart.left;
          cpos.end.x = clientEnd.right;
          cpos.start.y = clientStart.bottom;
          cpos.end.y = clientEnd.bottom;
        }
      } else {
        cpos.start.x = cursor.left;
        cpos.end.x = cursor.right;
        cpos.start.y = cursor.bottom;
        cpos.end.y = cursor.bottom;
      }
    }

    initialScroll.top = scrollTop;
    initialScroll.left = scrollLeft;
    if ($cm.isConnected) controls.checkForColor();
    update();
  }

  function update(left = 0, top = 0) {
    const offset = parseFloat(root.style.marginLeft) || 0;

    $start.style.transform = `translate3d(${
      cpos.start.x + 1 + left - offset
    }px, ${cpos.start.y + top}px, 0)`;

    $end.style.transform = `translate3d(${cpos.end.x + 4 + left - offset}px, ${
      cpos.end.y + top
    }px, 0)`;

    const cm = {
      left: cpos.end.x + left - offset,
      top: cpos.end.y - (40 + lineHeight) + top,
    };
    const containerWidth = innerWidth - 40;
    let scale = 1;

    $cm.style.transform = `translate3d(${cm.left}px, ${cm.top}px, 0) scale(${scale})`;

    const cmClient = $cm.getBoundingClientRect();

    if (cmClient.width > containerWidth)
      scale = containerWidth / cmClient.width;

    if (cmClient.right > containerWidth) {
      cm.left = containerWidth - cmClient.width;
      cm.left = cm.left < 0 ? Math.abs(cm.left) / 2 : cm.left;
    }

    if (cmClient.left < 0) {
      cm.left = 0;
    }

    if (cmClient.right > containerWidth) {
      cm.left = (containerWidth - cmClient.width * scale) / 2;
    }

    if (cmClient.top < containerClient.top) {
      cm.top += 80;
    }

    $cm.style.transform = `translate3d(${cm.left}px, ${cm.top}px, 0) scale(${scale})`;
  }

  function disable() {
    if (disabled) return;
    disabled = true;

    $start.remove();
    $end.remove();
    $cm.remove();

    $end.style.removeProperty('margin-left');
    $end.style.removeProperty('margin-top');
    $start.style.removeProperty('margin-left');
    $start.style.removeProperty('margin-top');

    $content.removeEventListener('click', disable);
    editor.session.off('changeScrollTop', updatePosition);
    editor.session.off('changeScrollLeft', updatePosition);
    editor.selection.off('changeCursor', onchange);
    $start.ontouchstart = null;
    $end.ontouchstart = null;
    controls.update = null;
    editor.textInput.getElement().oninput = null;
  }
}

export default select;
