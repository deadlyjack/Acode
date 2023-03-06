import tag from "html-tag-js";
import dialogs from "../components/dialogs";
import constants from "../lib/constants";
import selectionMenu from "../lib/selectionMenu";
import helpers from "../utils/helpers";
import appSettings from '../lib/settings';

/**
 * Handler for touch events
 * @param {AceAjax.Editor} editor 
 */
export default function addTouchListeners(editor) {
  const { renderer, container: $el } = editor;
  const { scroller, $gutter } = renderer;

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
  });

  /**
   * Text menu for touch devices
   */
  const $menu = tag('menu', {
    className: 'cursor-menu',
  });

  let scrollTimeout; // timeout to check if scrolling is finished
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
  let lastClickPos = null;
  let teardropDoesShowMenu = true; // teardrop handler
  let teardropTouchEnded = false; // teardrop handler
  let teardropMoveTimeout; // teardrop handler
  let $activeTeardrop;

  const timeToSelectText = 500; // ms
  const config = {
    passive: false, // allow preventDefault
  };

  $el.addEventListener('touchstart', touchStart, config);
  scroller.addEventListener('contextmenu', contextmenu, config);
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

  editor.setSelection = (value) => {
    selectionActive = value;
  };

  editor.setMenu = (value) => {
    menuActive = value;
  };

  /**
   * Editor container on touch start
   * @param {TouchEvent} e 
   */
  function touchStart(e) {
    const $target = e.target;
    cancelAnimationFrame(animation);
    const { clientX, clientY } = e.touches[0];

    if (isIn($start, clientX, clientY)) {
      e.preventDefault();
      teardropHandler($start);
      return;
    }

    if (isIn($end, clientX, clientY)) {
      e.preventDefault();
      teardropHandler($end);
      return;
    }

    if (isIn($cursor, clientX, clientY)) {
      e.preventDefault();
      teardropHandler($cursor);
      return;
    }

    if (
      $gutter.contains($target)
      || $target.classList.contains('ace_fold')
      || $target.classList.contains('ace_inline_button')
    ) {
      return;
    }

    lastX = clientX;
    lastY = clientY;
    moveY = 0;
    moveX = 0;
    lockX = false;
    lockY = false;
    mode = 'wait';

    setTimeout(() => {
      clickCount = 0;
      lastClickPos = null;
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

    const threshold = appSettings.value.touchMoveThreshold;
    const touchMoved = Math.abs(moveX) < threshold;

    if (appSettings.value.textWrap || touchMoved) {
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
    }
  }

  /**
   * Editor container on touch end
   * @param {TouchEvent} e 
   */
  function touchEnd(e) {
    // why I was using e.preventDefault() ? 🤔
    // because select word and select line misbehave without
    // preventDefault
    removeListeners();

    const { clientX, clientY } = e.changedTouches[0];

    if (mode === 'wait') {
      if (lastClickPos) {
        const {
          clientX: clickXThen,
          clientY: clickYThen,
        } = lastClickPos;
        const {
          row: rowNow,
          column: columnNow,
        } = renderer.screenToTextCoordinates(clientX, clientY);
        const {
          row: rowThen,
          column: columnThen,
        } = renderer.screenToTextCoordinates(clickXThen, clickYThen);

        const rowDiff = Math.abs(rowNow - rowThen);
        const columnDiff = Math.abs(columnNow - columnThen);
        if (!rowDiff && columnDiff <= 2) {
          clickCount += 1;
        }
      } else {
        clickCount = 1;
      }

      lastClickPos = { clientX, clientY };

      if (clickCount === 2) {
        mode = 'selection';
      } else if (clickCount >= 3) {
        mode = 'select-line';
      } else {
        mode = 'cursor';
      }
    }

    if (mode === 'cursor') {
      e.preventDefault();
      const shiftKey = tag.get('#shift-key')?.dataset.state === 'on';
      moveCursorTo(clientX, clientY, shiftKey);
      if (shiftKey) {
        selectionMode($end);
      }
      cursorMode();
      return;
    }

    if (mode === 'scroll') {
      scrollAnimation(moveX, moveY);
      return;
    }

    if (mode === 'selection') {
      e.preventDefault();
      moveCursorTo(clientX, clientY);
      select();
      vibrate();
      return;
    }

    if (mode === 'select-line') {
      e.preventDefault();
      moveCursorTo(clientX, clientY);
      editor.selection.selectLine();
      selectionMode($end);
      vibrate();
    }
  };

  function isIn($el, cX, cY) {
    const {
      x,
      y,
      left,
      top,
      width: sWidth,
      height: sHeight,
    } = $el.getBoundingClientRect();

    const sx = x || left;
    const sy = y || top;

    return (cX > sx && cX < sx + sWidth
      && cY > sy && cY < sy + sHeight)
  }

  function vibrate() {
    if (appSettings.value.vibrateOnTap) {
      navigator.vibrate(constants.VIBRATION_TIME);
    }
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function contextmenu(e) {
    e.preventDefault();
    const { clientX, clientY } = e;
    moveCursorTo(clientX, clientY);
    select();
    selectionMode($end);
  }

  function select() {
    removeListeners();
    const range = editor.selection.getWordRange();
    if (!range || range?.isEmpty()) return;
    editor.blur();
    editor.selection.setSelectionRange(range);
    editor.focus();
    selectionMode($end);
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
    // Why I used it in first place?
    // const { scrollLeft } = editor.renderer.scrollBarH;
    const { scrollLeft } = editor.renderer.getScrollLeft();
    // const { scrollTop } = editor.renderer.scrollBarV;
    const { scrollTop } = editor.renderer.getScrollTop();
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

  function moveCursorTo(x, y, shiftKey = false) {
    const pos = renderer.screenToTextCoordinates(x, y);
    editor.blur();
    if (shiftKey) {
      let anchor = editor.selection.getSelectionAnchor();
      if (!anchor) {
        anchor = editor.getCursorPosition();
      }
      editor.selection.setRange({
        start: anchor,
        end: pos,
      });
    } else {
      editor.selection.moveToPosition(pos);
    }
    editor.focus();
    hideTooltip();
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
   * @param {Event} ev 
   * @param {boolean} clearActive 
   * @returns 
   */
  function clearSelectionMode(ev, clearActive = true) {
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

    if (!$menu.isConnected) $el.parentElement.append($menu);
    if ($trigger) positionMenu($trigger);

    editor.selection.on('changeCursor', hideMenu);
    editor.selection.on('changeSelection', hideMenu);
  }

  /**
   * @param {boolean} clearActive 
   * @returns 
   */
  function hideMenu(clearActive = true) {
    if (!$el.parentElement.contains($menu)) return;
    $menu.remove();
    editor.selection.off('changeCursor', hideMenu);
    editor.selection.off('changeSelection', hideMenu);
    if (clearActive) menuActive = false;
  }

  function positionMenu($trigger) {
    const getProp = ($el, prop) => $el.getBoundingClientRect()[prop];
    const containerRight = getProp($el, 'right');
    const containerLeft = getProp($el, 'left');
    const containerBottom = getProp($el, 'bottom');
    const { lineHeight } = editor.renderer;
    const margin = 10;


    // if menu is positioned off screen horizonatally from the right
    const menuRight = getProp($menu, 'right');
    if (menuRight + margin > containerRight) {
      const menuLeft = getProp($menu, 'left');
      const [x] = relativePosition(menuLeft - Math.abs(menuRight - containerRight));
      $menu.style.left = `${x - margin}px`;
    }

    // if menu is positioned off screen horizonatally from the left
    const menuLeft = getProp($menu, 'left');
    if (menuLeft - margin < containerLeft) {
      const [x] = relativePosition(menuLeft + Math.abs(menuLeft - containerLeft));
      $menu.style.left = `${x + margin}px`;
    }

    if (shrink()) return;

    // if menu is positioned off screen vertically from the bottom
    const menuBottom = getProp($menu, 'bottom');
    if (menuBottom > containerBottom) {
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

    function shrink() {
      const [left, right] = [getProp($menu, 'left'), getProp($menu, 'right')];
      const tooLeft = left < containerLeft;
      const tooRight = right > containerRight;
      if (tooLeft || tooRight) {
        const { scale = 1 } = $menu.dataset;
        $menu.dataset.scale = parseFloat(scale - 0.1);
        $menu.style.transform = `scale(${$menu.dataset.scale})`;
        positionMenu($trigger);
        return true;
      }
      return false;
    }
  }

  /**
   * Handles teardrop
   * @param {HTMLDivElement} $teardrop
   */
  function teardropHandler($teardrop) {
    $activeTeardrop = $teardrop;
    $activeTeardrop.dataset.immortal = true;
    teardropDoesShowMenu = true;
    teardropTouchEnded = false;

    if (mode === 'cursor') {
      clearTimeout($cursor.dataset.timeout);
    }

    document.addEventListener('touchmove', teardropTouchMoveHandler, config);
    document.addEventListener('touchend', teardropTouchEndHandler, config);
  }

  function teardropTouchMoveHandler(e) {
    const { clientX, clientY } = e.touches[0];
    const { lineHeight } = renderer;
    const { start, end } = editor.selection.getRange();
    let y = clientY - (lineHeight * 1.8);
    let line;
    let x = clientX;

    if ($activeTeardrop === $cursor) {
      const { row, column } = renderer.screenToTextCoordinates(x, y);
      editor.gotoLine(row + 1, column);
    } else if ($activeTeardrop === $start) {
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
    }

    clearTimeout(teardropMoveTimeout);
    const parent = $el.getBoundingClientRect();
    let dx = 0;
    if (clientY < parent.top) dx = -lineHeight;
    if (clientY > parent.bottom) dx = lineHeight;
    if (dx) {
      console.log('dx', dx);
      teardropMoveTimeout = setTimeout(() => {
        const top = editor.session.getScrollTop();
        editor.session.setScrollTop(top + dx);
        if (teardropTouchEnded) return;
        teardropTouchMoveHandler(e);
      }, 100);
    }

    const [left, top] = relativePosition(clientX, clientY - lineHeight);
    $activeTeardrop.style.left = `${left}px`;
    $activeTeardrop.style.top = `${top}px`;
    teardropDoesShowMenu = false;
  };

  function teardropTouchEndHandler() {
    teardropTouchEnded = true;
    if ($activeTeardrop === $cursor) {
      cursorMode();
    } else {
      selectionMode($activeTeardrop);
    }

    $activeTeardrop.dataset.immortal = false;
    document.removeEventListener('touchmove', teardropTouchMoveHandler, config);
    document.removeEventListener('touchend', teardropTouchEndHandler, config);
    if (teardropDoesShowMenu) {
      showMenu($activeTeardrop);
    }
    editor.focus();
  }

  function onscroll() {
    clearTimeout(scrollTimeout);
    clearCursorMode();
    clearSelectionMode(null, false);
    hideMenu(false);

    hideTooltip();
    scrollTimeout = setTimeout(onscrollend, 100);
  }

  function hideTooltip() {
    $gutter.dispatchEvent(new MouseEvent('mouseout'));
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
    const copyText = editor.getCopyText();
    const items = [];

    selectionMenu().forEach((item) => {
      if (mode === 'read-only' && !item.readOnly) return;
      if (copyText && !['selected', 'all'].includes(item.mode)) return;
      if (!copyText && item.mode === 'selected') return;

      items.push(item);
    });

    items.forEach(({ onclick, text }) => {
      $menu.append(
        <div onclick={onclick}>{text}</div>
      );
    });
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
