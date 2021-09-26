import './scrollbar.scss';
import tag from 'html-tag-js';

/**
 *
 * @param {Object} options
 * @param {HTMLElement} [options.parent]
 * @param {"top"|"left"|"right"|"bottom"} [options.direction = "right"]
 * @param {Number} [options.width]
 * @param {function():void} [options.onscroll]
 * @param {function():void} [options.onscrollend]
 * @returns {Scrollbar}
 */
export default function ScrollBar(options) {
  if (!options || !options.parent) {
    throw new Error('ScrollBar.js: Parent element required.');
  }
  options.direction = options.direction || 'right';

  const $cursor = tag('span', {
    className: 'cursor',
    style: {
      top: 0,
      left: 0,
    },
  });
  const $thumb = tag('span', {
    className: 'thumb',
  });
  const $container = tag('div', {
    className: 'container',
    children: [$cursor, $thumb],
  });
  const $scrollbar = tag('div', {
    className: 'scrollbar-container ' + (options.direction || 'right'),
    child: $container,
  });
  const config = {
    passive: false,
  };
  const TIMEOUT = 2000;
  const isVertical =
    options.direction === 'right' || options.direction === 'left';
  const observer = new MutationObserver(observerCallback);
  let scroll = 0,
    touchStartValue = {
      x: 0,
      y: 0,
    },
    scrollbarSize = 20,
    height,
    width,
    rect,
    scrollbarTimeoutHide,
    scrollbarTimeoutRemove,
    onshow,
    onhide;

  if (options.width) scrollbarSize = options.width;

  setWidth(scrollbarSize);
  $scrollbar.onScroll = options.onscroll;
  $scrollbar.onScrollEnd = options.onscrollend;
  $thumb.addEventListener('touchstart', touchStart, config);
  $thumb.addEventListener('mousedown', touchStart, config);
  window.addEventListener('resize', resize);
  observer.observe($cursor, {
    attributes: true,
  });

  function observerCallback() {
    $thumb.style.top = $cursor.style.top;
    $thumb.style.left = $cursor.style.left;
  }

  function setWidth(width) {
    if (isVertical) $scrollbar.style.width = $cursor.style.width = width + 'px';
    else $scrollbar.style.height = $cursor.style.height = width + 'px';
  }

  /**
   *
   * @param {TouchEvent|MouseEvent} e
   */
  function touchStart(e) {
    e.preventDefault();
    if (!rect) resize();
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    touchStartValue.x = touch.clientX;
    touchStartValue.y = touch.clientY;
    $scrollbar.classList.add('active');
    document.addEventListener('touchmove', touchMove, config);
    document.addEventListener('mousemove', touchMove, config);
    document.addEventListener('touchend', touchEnd, config);
    document.addEventListener('mouseup', touchEnd, config);
    document.addEventListener('touchcancel', touchEnd, config);
    clearTimeout(scrollbarTimeoutHide);
  }

  /**
   *
   * @param {TouchEvent | MouseEvent} e
   */
  function touchMove(e) {
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    const touchDiffX = touchStartValue.x - touch.clientX;
    const touchDiffY = touchStartValue.y - touch.clientY;
    touchStartValue.x = touch.clientX;
    touchStartValue.y = touch.clientY;

    if (isVertical) {
      let top = parseFloat($cursor.style.top) - touchDiffY;
      const currentTopValue = parseFloat($cursor.style.top);

      if (top < 0) top = 0;
      else if (top > height) top = height;

      if (currentTopValue !== top) {
        $cursor.style.top = top + 'px';
        scroll = top / height;
        if (typeof $scrollbar.onScroll === 'function')
          $scrollbar.onScroll(scroll);
      }
    } else {
      let left = parseFloat($cursor.style.left) - touchDiffX;
      const currentLeftValue = parseFloat($cursor.style.left);

      if (left < 0) left = 0;
      else if (left > width) left = width;

      if (currentLeftValue !== left) {
        $cursor.style.left = left + 'px';
        scroll = left / width;
        if (typeof $scrollbar.onScroll === 'function')
          $scrollbar.onScroll(scroll);
      }
    }
  }

  /**
   *
   * @param {TouchEvent|MouseEvent} e
   */
  function touchEnd(e) {
    e.preventDefault();
    $scrollbar.classList.remove('active');
    document.removeEventListener('touchmove', touchMove, config);
    document.removeEventListener('mousemove', touchMove, config);
    document.removeEventListener('touchend', touchEnd, config);
    document.removeEventListener('mouseup', touchEnd, config);
    document.removeEventListener('touchcancel', touchEnd, config);
    if (typeof $scrollbar.onScrollEnd === 'function') $scrollbar.onScrollEnd();
    scrollbarTimeoutHide = setTimeout(hide, TIMEOUT);
  }

  function resize(render = true) {
    rect = $scrollbar.getBoundingClientRect();
    height = rect.height - 20;
    width = rect.width - 20;

    if (height < 0) height = 0;
    if (width < 0) width = 0;
    if (render && height && width) setValue(scroll);
  }

  function setValue(val) {
    if (!height || !width) resize(false);

    //Make sure value is between 0 and 1
    if (val < 0) val = 0;
    else if (val > 1) val = 1;

    scroll = val;
    if (isVertical) $cursor.style.top = val * height + 'px';
    else $cursor.style.left = val * width + 'px';
  }

  function destroy() {
    window.removeEventListener('resize', resize);
    $thumb.removeEventListener('touchstart', touchStart);
    observer.disconnect();
    if (typeof onhide === 'function') onhide();
  }

  function render() {
    show();
    scrollbarTimeoutHide = setTimeout(hide, TIMEOUT);
  }

  function show() {
    clearTimeout(scrollbarTimeoutHide);
    clearTimeout(scrollbarTimeoutRemove);
    $scrollbar.classList.remove('hide');
    if (!$scrollbar.isConnected) {
      options.parent.append($scrollbar);
      if (typeof onshow === 'function') onshow();
    }
  }

  function hide() {
    $scrollbar.classList.add('hide');
    scrollbarTimeoutRemove = setTimeout(() => $scrollbar.remove(), 300);
    if (typeof onhide === 'function') onhide();
  }

  Object.defineProperty($scrollbar, 'size', {
    get: () => scrollbarSize,
    set: setWidth,
  });

  Object.defineProperty($scrollbar, 'resize', {
    value: resize,
  });

  Object.defineProperty($scrollbar, 'value', {
    get: () => scroll,
    set: setValue,
  });

  Object.defineProperty($scrollbar, 'destroy', {
    value: destroy,
  });

  Object.defineProperty($scrollbar, 'render', {
    value: render,
  });

  Object.defineProperty($scrollbar, 'show', {
    value: show,
  });

  Object.defineProperty($scrollbar, 'hide', {
    value: hide,
  });

  Object.defineProperty($scrollbar, 'onshow', {
    set(fun) {
      onshow = fun;
    },
    get() {
      return onshow;
    },
  });

  Object.defineProperty($scrollbar, 'onhide', {
    set(fun) {
      onhide = fun;
    },
    get() {
      return onhide;
    },
  });

  return $scrollbar;
}
