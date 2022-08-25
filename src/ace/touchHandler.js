import tag from "html-tag-js";
import constants from "../lib/constants";
import helpers from "../utils/helpers";

/**
 * Handler for touch events
 * @param {AceAjax.Editor} editor 
 */
export default function addTouchListeners(editor) {
  const { renderer, container: $el } = editor;
  const { scroller } = renderer;

  if ($el.touchListeners) {
    Object.keys($el.touchListeners).forEach((key) => {
      $el.touchListeners[key].forEach((event) => {
        $el.removeEventListener(key, event.listener, event.useCapture);
      })
    });
  }

  let {
    diagonalScrolling,
    reverseScrolling,
    teardropSize,
    teardropTimeout,
    scrollSpeed,
  } = appSettings.value;

  /**
   * Selection controller start
   */
  const $start = tag('span', {
    className: "cursor start",
    dataset: {
      size: teardropSize,
    },
    ontouchstart: ontouchstart$start,
    size: teardropSize,
  });

  /**
   * Selection controller end
   */
  const $end = tag('span', {
    className: "cursor end",
    dataset: {
      size: teardropSize,
    },
    ontouchstart: ontouchstart$end,
    size: teardropSize,
  });

  /**
   * Tear drop cursor
   */
  const $cursor = tag('span', {
    className: "cursor single",
    dataset: {
      size: teardropSize,
    },
    get size() {
      const widthSq = teardropSize * teardropSize * 2;
      const actualWidth = Math.sqrt(widthSq);
      delete this.size;
      this.size = actualWidth;
      return actualWidth;
    },
    startHide() {
      clearTimeout($cursor.dataset.timeout);
      $cursor.dataset.timeout = setTimeout(() => {
        $cursor.remove();
        hideMenu();
      }, teardropTimeout);
    },
    ontouchstart: ontouchstart$curosr,
  });

  /**
   * Text menu for touch devices
   */
  const $menu = tag('menu', {
    className: 'cursor-menu',
    onclick(e) {
      editor.focus();
      const { action } = e.target.dataset;
      if (!action) return;

      editor.execCommand(action);
      if (action === 'selectall') {
        editor.scrollToRow(Infinity);
        selectionActive = true;
        menuActive = true;
      }
    }
  });

  let scrollTimeout; // timeout to check if scrolling is finished
  let selectionTimeout; // timeout for context menu
  let menuActive; // true if menu is active
  let selectionActive; // true if selection is active
  let animation; // animation frame id
  let moveY; // touch difference in vertical direction
  let moveX; // touch difference in horizontal direction
  let lastX; // last x
  let lastY; // last y
  let lockX; // lock x for prevent scrolling in horizontal direction
  let lockY; // lock y for prevent scrolling in vertical direction
  let mode; // cursor, selection or scroll
  let clickCount = 0; // number of clicks

  const timeToSelectText = 500; // ms
  const config = {
    passive: false, // allow preventDefault
  };

  scroller.addEventListener('touchstart', touchStart, config);
  editor.on('change', onupdate);
  editor.on('fold', onfold);
  editor.on('scroll', onscroll);
  editor.on('changeSession', onchangesession);

  appSettings.on('update:diagonalScrolling', (value) => {
    diagonalScrolling = value;
  });
  appSettings.on('update:reverseScrolling', (value) => {
    reverseScrolling = value;
  });
  appSettings.on('update:teardropSize', (value) => {
    teardropSize = value;
    $start.dataset.size = value;
    $end.dataset.size = value;
    $cursor.dataset.size = value;
  });
  appSettings.on('update:textWrap', onupdate);
  appSettings.on('update:scrollSpeed', (value) => {
    scrollSpeed = value;
  });

  /**
   * Editor container on touch start
   * @param {TouchEvent} e 
   */
  function touchStart(e) {
    cancelAnimationFrame(animation);
    const { clientX, clientY } = e.touches[0];
    lastX = clientX;
    lastY = clientY;
    moveY = 0;
    moveX = 0;
    lockX = false;
    lockY = false;
    mode = 'wait';
    const preventDefault = (e) => {
      e.preventDefault();
    }

    e.target.ontouchstart = preventDefault;
    e.target.oncontextmenu = preventDefault;

    selectionTimeout = setTimeout(() => {
      e.preventDefault();
      moveCursorTo(clientX, clientY);
      select();
      removeListeners();
    }, timeToSelectText);

    setTimeout(() => {
      clickCount = 0;
    }, timeToSelectText);

    document.addEventListener('touchmove', touchMove, config);
    document.addEventListener('touchend', touchEnd, config);
  }

  /**
   * Editor container on touch move
   * @param {TouchEvent} e 
   */
  function touchMove(e) {
    if (mode === 'selection') {
      removeListeners();
      return;
    }

    const { clientX, clientY } = e.touches[0];

    moveX = clientX - lastX;
    moveY = clientY - lastY;

    if (!moveX && !moveY) {
      return;
    }

    if (!lockX && !lockY) {
      if (Math.abs(moveX) > Math.abs(moveY)) {
        lockY = true;
      } else {
        lockX = true;
      }
    }

    lastX = clientX;
    lastY = clientY;

    const threshold = Math.round((1 / devicePixelRatio) * 10) / 10;
    if (appSettings.value.textWrap || Math.abs(moveX) < threshold) {
      moveX = 0;
    }

    if (Math.abs(moveY) < threshold) {
      moveY = 0;
    }

    if (moveX || moveY) {
      e.preventDefault();
      [moveX, moveY] = testScroll(moveX, moveY);
      mode = 'scroll';
      scroll(moveX, moveY);
      clearTimeout(selectionTimeout);
    }
  }

  /**
   * Editor container on touch end
   * @param {TouchEvent} e 
   */
  function touchEnd(e) {
    removeListeners();

    const { clientX, clientY } = e.changedTouches[0];
    clearTimeout(selectionTimeout);

    if (mode === 'wait') {
      if (++clickCount >= 2) {
        mode = 'selection';
      } else {
        mode = 'cursor';
      }
    }

    if (mode === 'cursor') {
      moveCursorTo(clientX, clientY);
      cursorMode();
      return;
    }

    if (mode === 'scroll') {
      e.preventDefault();
      scrollAnimation(moveX, moveY);
      return;
    }

    if (mode === 'selection') {
      e.preventDefault();
      moveCursorTo(clientX, clientY);
      select();
      return;
    }
  };

  function select() {
    removeListeners();
    const range = editor.selection.getWordRange();
    if (!range || range?.isEmpty()) return;
    editor.blur();
    editor.selection.setSelectionRange(range);
    editor.focus();
    selectionMode($end);

    if (appSettings.value.vibrateOnTap) {
      navigator.vibrate(constants.VIBRATION_TIME);
    }
  }

  function scrollAnimation(moveX, moveY) {
    const nextX = moveX * scrollSpeed;
    const nextY = moveY * scrollSpeed;

    let scrollX = parseInt(nextX * 100) / 100;
    let scrollY = parseInt(nextY * 100) / 100;

    const [canScrollX, canScrollY] = testScroll(moveX, moveY);

    if (!canScrollX) {
      moveX = 0;
      scrollX = 0;
    }

    if (!canScrollY) {
      moveY = 0;
      scrollY = 0;
    }

    if (!scrollX && !scrollY) {
      cancelAnimationFrame(animation);
      return;
    }

    scroll(moveX, moveY);
    moveX -= scrollX;
    moveY -= scrollY;

    animation = requestAnimationFrame(
      scrollAnimation.bind(null, moveX, moveY),
    );
  }

  /**
   * BUG: not reliable
   * Test if scrolling is possible
   * @param {number} moveX 
   * @param {number} moveY 
   * @returns 
   */
  function testScroll(moveX, moveY) {
    const UP = reverseScrolling ? 'down' : 'up';
    const DOWN = reverseScrolling ? 'up' : 'down';
    const LEFT = reverseScrolling ? 'right' : 'left';
    const RIGHT = reverseScrolling ? 'left' : 'right';

    const vDirection = moveY > 0 ? DOWN : UP;
    const hDirection = moveX > 0 ? RIGHT : LEFT;

    const { getEditorHeight, getEditorWidth } = helpers;
    const { scrollLeft } = editor.renderer.scrollBarH;
    const { scrollTop } = editor.renderer.scrollBarV;
    const [editorWidth, editorHeight] = [getEditorWidth(editor), getEditorHeight(editor)];

    if (
      (vDirection === 'down' && scrollTop <= 0)
      || (vDirection === 'up' && scrollTop >= editorHeight)
    ) {
      moveY = 0;
    }

    if (
      (hDirection === 'right' && scrollLeft <= 0)
      || (hDirection === 'left' && scrollLeft >= editorWidth)
    ) {
      moveX = 0;
    }


    return [moveX, moveY];
  }

  function scroll(x, y) {
    let direction = reverseScrolling ? 1 : -1;
    let scrollX = direction * x;
    let scrollY = direction * y;

    if (!diagonalScrolling) {
      if (lockX) {
        scrollX = 0;
      } else {
        scrollY = 0;
      }
    }

    renderer.scrollBy(scrollX, scrollY);
  }

  function removeListeners() {
    document.removeEventListener('touchmove', touchMove, config);
    document.removeEventListener('touchend', touchEnd, config);
  }

  function moveCursorTo(x, y) {
    const pos = renderer.screenToTextCoordinates(x, y);
    editor.blur();
    editor.selection.moveToPosition(pos);
    editor.focus();
  }

  function cursorMode() {
    if (!teardropSize) return;

    clearTimeout($cursor.dataset.timeout);
    clearSelectionMode();

    const { pageX, pageY } = renderer.textToScreenCoordinates(
      editor.getCursorPosition(),
    );
    const { lineHeight } = renderer;
    const actualHeight = lineHeight;
    const [x, y] = relativePosition(pageX, pageY + actualHeight);
    $cursor.style.left = `${x}px`;
    $cursor.style.top = `${y}px`;
    if (!$cursor.isConnected) $el.append($cursor);
    $cursor.startHide();

    editor.selection.on('changeCursor', clearCursorMode);
  }

  /**
   * Remove cursor mode
   * @returns 
   */
  function clearCursorMode() {
    if (!$el.contains($cursor)) return;
    if ($cursor.dataset.immortal === 'true') return;
    $cursor.remove();
    clearTimeout($cursor.dataset.timeout);

    editor.selection.off('changeCursor', clearCursorMode);
  }

  function selectionMode($trigger) {
    if (!teardropSize) return;

    clearCursorMode();
    selectionActive = true;
    positionEnd();
    positionStart();
    if ($trigger) showMenu($trigger);

    setTimeout(() => {
      editor.selection.on('changeSelection', clearSelectionMode);
      editor.selection.on('changeCursor', clearSelectionMode);
    }, 0);
  }

  function positionStart() {
    const range = editor.getSelectionRange();
    const { pageX, pageY } = renderer.textToScreenCoordinates(range.start);
    const { lineHeight } = renderer;
    const [x, y] = relativePosition(pageX - teardropSize, pageY + lineHeight)

    $start.style.left = `${x}px`;
    $start.style.top = `${y}px`;

    if (!$start.isConnected) $el.append($start);
  }

  function positionEnd() {
    const range = editor.getSelectionRange();
    const { pageX, pageY } = renderer.textToScreenCoordinates(range.end);
    const { lineHeight } = renderer;
    const [x, y] = relativePosition(pageX, pageY + lineHeight);

    $end.style.left = `${x}px`;
    $end.style.top = `${y}px`;

    if (!$end.isConnected) $el.append($end);
  }

  /**
   * Remove selection mode
   * @param {Event} ignore 
   * @param {boolean} clearActive 
   * @returns 
   */
  function clearSelectionMode(ignore, clearActive = true) {
    const $els = [$start.dataset.immortal, $end.dataset.immortal];
    if ($els.includes('true')) return;
    if ($el.contains($start)) $start.remove();
    if ($el.contains($end)) $end.remove();
    if (clearActive) {
      selectionActive = false;
    }

    editor.selection.off('changeSelection', clearSelectionMode);
    editor.selection.off('changeCursor', clearSelectionMode);
  }

  /**
 * 
 * @param {HTMLElement} [$trigger] 
 */
  function showMenu($trigger) {
    menuActive = true;
    const rect = $trigger?.getBoundingClientRect();
    const { bottom, left } = rect;
    const readOnly = editor.getReadOnly();
    const [x, y] = relativePosition(left, bottom);
    if (readOnly) {
      populateMenuItems('read-only');
    } else {
      populateMenuItems();
    }

    $menu.style.left = `${x}px`;
    $menu.style.top = `${y}px`;

    if (!$menu.isConnected) $el.append($menu);
    if ($trigger) positionMenu($trigger);

    editor.selection.on('changeCursor', hideMenu);
    editor.selection.on('changeSelection', hideMenu);
  }

  function positionMenu($trigger) {
    const rectMenu = $menu.getBoundingClientRect();
    const rectContainer = $el.getBoundingClientRect();
    const { left, right, top, bottom, height } = rectMenu;
    const { lineHeight } = editor.renderer;
    const margin = 10;

    // if menu is positioned off screen horizonatally from the right
    if ((right + margin) > rectContainer.right) {
      const [x] = relativePosition(left - (right - rectContainer.right) - margin);
      $menu.style.left = `${x}px`;
    }

    // if menu is positioned off screen horizonatally from the left
    if ((left - margin) < rectContainer.left) {
      const [x] = relativePosition(left + (rectContainer.left - left) + margin);
      $menu.style.left = `${x}px`;
    }

    // if menu is positioned off screen vertically from the bottom
    if (bottom > rectContainer.bottom) {
      const range = editor.getSelectionRange();
      let pos;

      if ($trigger === $start) {
        pos = range.start;
      } else {
        pos = range.end;
      }

      const { pageY } = renderer.textToScreenCoordinates(pos);
      const [, y] = relativePosition(null, pageY - lineHeight * 1.8);
      $menu.style.top = `${y}px`;
    }
  }

  function hideMenu(ignore, clearActive = true) {
    if (!$el.contains($menu)) return;
    $menu.remove();
    editor.selection.off('changeCursor', hideMenu);
    editor.selection.off('changeSelection', hideMenu);
    if (clearActive) menuActive = false;
  }

  /**
   * Touch start on cursor
   * @param {TouchEvent} e 
   */
  function ontouchstart$curosr(e) {
    handleCursor.call(this, e, 'cursor');
  }

  /**
   * Touch start on selection
   * @param {TouchEvent} e 
   */
  function ontouchstart$start(e) {
    handleCursor.call(this, e, 'start');
  }

  /**
   * Touch start on selection
   * @param {TouchEvent} e 
   */
  function ontouchstart$end(e) {
    handleCursor.call(this, e, 'end');
  }

  /**
   * 
   * @param {TouchEvent} e 
   * @param {'cursor'|'start'|'end'} mode 
   */
  function handleCursor(e, mode) {
    e.preventDefault();
    e.stopImmediatePropagation();
    editor.focus();
    this.dataset.immortal = true;
    let doesShowMenu = true;
    let touchEnded = false;
    let moveTimeout;

    if (mode === 'cursor') {
      clearTimeout($cursor.dataset.timeout);
    }


    const touchMove = (e) => {
      e.preventDefault();
      const { clientX, clientY } = e.touches[0];
      const { lineHeight } = renderer;
      const { start, end } = editor.selection.getRange();
      let y = clientY - (lineHeight * 1.8);
      let line;
      let x = clientX;
      let $el;

      if (mode === 'cursor') {
        const { row, column } = renderer.screenToTextCoordinates(x, y);
        editor.gotoLine(row + 1, column);
        line = row;
        $el = $cursor;
      } else if (mode === 'start') {
        x = clientX + teardropSize;

        const { pageX, pageY } = renderer.textToScreenCoordinates(end);
        if (pageY <= y) {
          y = pageY;
        }

        if (pageY <= y && pageX < x) {
          x = pageX;
        }

        let { row, column } = renderer.screenToTextCoordinates(x, y);

        if (column === end.column) {
          --column;
        }

        editor.selection.setSelectionAnchor(row, column);
        positionEnd();
        line = row;
        $el = $start;
      } else {
        const { pageX, pageY } = renderer.textToScreenCoordinates(start);
        if (pageY >= y) {
          y = pageY;
        }

        if (pageY >= y && pageX > x) {
          x = pageX;
        }

        let { row, column } = renderer.screenToTextCoordinates(x, y);

        if (column === start.column) {
          ++column;
        }

        editor.selection.moveCursorToPosition({ row, column });
        positionStart();
        line = row;
        $el = $end;
      }

      clearTimeout(moveTimeout);
      if (!editor.isRowFullyVisible(line)) {
        moveTimeout = setTimeout(() => {
          renderer.scrollToLine(line);
          if (touchEnded) return;
          touchMove(e);
        }, 100);
      }

      const [left, top] = relativePosition(clientX, clientY - lineHeight);
      $el.style.left = `${left}px`;
      $el.style.top = `${top}px`;
      doesShowMenu = false;
    };

    const touchEnd = (e) => {
      touchEnded = true;
      e.preventDefault();
      if (mode === 'cursor') {
        cursorMode();
      } else {
        selectionMode(this);
      }

      this.dataset.immortal = false;
      document.removeEventListener('touchmove', touchMove, config);
      document.removeEventListener('touchend', touchEnd, config);
      if (doesShowMenu) {
        showMenu(this);
      }
    };

    document.addEventListener('touchmove', touchMove, config);
    document.addEventListener('touchend', touchEnd, config);
  }

  function onscroll() {
    clearTimeout(scrollTimeout);
    clearCursorMode();
    clearSelectionMode(null, false);
    hideMenu(null, false);

    scrollTimeout = setTimeout(onscrollend, 100);
  }

  function onscrollend() {
    if (selectionActive) {
      selectionMode();
    }

    if (menuActive) {
      showMenu($end);
    }
  }

  function onupdate() {
    clearCursorMode();
    clearSelectionMode();
    hideMenu();
  }

  function onchangesession() {
    const copyText = editor.session.getTextRange(editor.getSelectionRange());
    if (!copyText) {
      menuActive = false;
      selectionActive = false;
    } else {
      selectionActive = true;
      menuActive = true;
    }
  }

  function onfold() {
    if (selectionActive) {
      positionEnd();
      positionStart();
      hideMenu();
      showMenu($end);
    } else {
      clearCursorMode();
    }
  }

  function populateMenuItems(mode = 'regular') {
    $menu.innerHTML = '';

    const menuItem = (text, action) => tag('span', {
      textContent: text,
      dataset: {
        action: action || text,
      },
    });

    const $copy = menuItem(strings.copy, 'copy');
    const $paste = menuItem(strings.paste, 'paste');
    const $cut = menuItem(strings.cut, 'cut');
    const $selectAll = menuItem(strings['select all'], 'selectall');

    const copyText = editor.getCopyText();

    if (mode === 'read-only') {
      if (copyText) {
        $menu.append($copy, $selectAll);
      } else {
        $menu.append($selectAll);
      }
      return;
    }

    if (copyText) {
      $menu.append($copy, $cut, $paste, $selectAll);
    } else {
      $menu.append($paste, $selectAll);
    }
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @returns 
   */
  function relativePosition(x, y) {
    const { top, left } = $el.getBoundingClientRect();
    return [x - left, y - top];
  }
}
