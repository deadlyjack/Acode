import tag from 'html-tag-js';

/**
 * 
 * @param {Object} options
 * @param {HTMLElement} [options.parent]
 * @param {"top"|"left"|"right"|"bottom"} [options.direction = "right"]
 * @param {Number} [options.width]
 * @param {function():void} [options.onscroll]
 * @param {function():void} [options.onscrollend]
 */
export default function ScrollBar(options) {
  if (!options || !options.parent) throw new Error("Parent element required.");
  options.direction = options.direction || "right";

  const $cursor = tag('span', {
    className: "cursor",
    style: {
      top: 0,
      left: 0
    }
  });
  const $thumb = tag('span', {
    className: "thumb"
  });
  const $container = tag('div', {
    className: 'container',
    children: [$cursor, $thumb]
  });
  const $scrollbar = tag('div', {
    className: "scrollbar-container " + (options.direction || "right"),
    child: $container
  });
  const config = {
    passive: false
  };
  const isVertical = (options.direction === "right" || options.direction === "left");
  const observer = new MutationObserver(observerCallback);
  let scroll = 0,
    touchStartValue = {
      x: 0,
      y: 0
    },
    height, width, rect, scrollbarTimeout;

  if (options.width) {
    if (isVertical) $scrollbar.style.width = $cursor.style.width = options.width + 'px';
    else $scrollbar.style.height = $cursor.style.height = options.width + 'px';
  }

  $scrollbar.onScroll = options.onscroll;
  $scrollbar.onScrollEnd = options.onscrollend;
  $thumb.addEventListener("touchstart", touchStart, config);
  window.addEventListener('resize', resize);

  function observerCallback() {
    $thumb.style.top = $cursor.style.top;
    $thumb.style.left = $cursor.style.left;
  }

  observer.observe($cursor, {
    attributes: true
  });

  /**
   * 
   * @param {TouchEvent} e 
   */
  function touchStart(e) {
    e.preventDefault();
    if (!rect) resize();
    const touch = e.touches[0];
    touchStartValue.x = touch.clientX;
    touchStartValue.y = touch.clientY;
    $scrollbar.classList.add("active");
    document.addEventListener("touchmove", touchMove, config);
    document.addEventListener("touchend", touchEnd, config);
    document.addEventListener("touchcancel", touchEnd, config);
    clearTimeout(scrollbarTimeout);
  }

  /**
   * 
   * @param {TouchEvent} e 
   */
  function touchMove(e) {
    const touch = e.touches[0];
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
        if (typeof $scrollbar.onScroll === "function") $scrollbar.onScroll(scroll);
      }
    } else {
      let left = parseFloat($cursor.style.left) - touchDiffX;
      const currentLeftValue = parseFloat($cursor.style.left);

      if (left < 0) left = 0;
      else if (left > width) left = width;

      if (currentLeftValue !== left) {
        $cursor.style.left = left + 'px';
        scroll = left / width;
        if (typeof $scrollbar.onScroll === "function") $scrollbar.onScroll(scroll);
      }
    }
  }

  /**
   * 
   * @param {TouchEvent} e 
   */
  function touchEnd(e) {
    e.preventDefault();
    $scrollbar.classList.remove("active");
    document.removeEventListener("touchmove", touchMove, config);
    document.removeEventListener("touchend", touchEnd, config);
    document.removeEventListener("touchcancel", touchEnd, config);
    if (typeof $scrollbar.onScrollEnd === "function") $scrollbar.onScrollEnd();
    scrollbarTimeout = setTimeout(() => {
      $scrollbar.remove();
    }, 1000);
  }

  function resize() {
    rect = $scrollbar.getBoundingClientRect();
    height = rect.height - 20;
    width = rect.width - 20;

    if (height < 0) height = 0;
    if (width < 0) width = 0;
  }

  Object.defineProperty($scrollbar, "value", {
    get() {
      return scroll;
    },
    set(val) {
      if (!height || !width) resize();
      scroll = val;
      if (isVertical) $cursor.style.top = (val * height) + 'px';
      else $cursor.style.left = (val * width) + 'px';
    }
  });

  Object.defineProperty($scrollbar, "destroy", {
    value() {
      window.removeEventListener("resize", resize);
      $thumb.removeEventListener("touchstart", touchStart);
      observer.disconnect();
    }
  });

  Object.defineProperty($scrollbar, "render", {
    value() {
      options.parent.append($scrollbar);

      clearTimeout(scrollbarTimeout);
      scrollbarTimeout = setTimeout(() => {
        $scrollbar.remove();
      }, 3000);
    }
  });

  return $scrollbar;
}