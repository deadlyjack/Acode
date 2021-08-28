import tag from 'html-tag-js';
import openFolder from '../lib/openFolder';

/**
 * @typedef {object} SideBar
 * @property {function():void} hide
 * @property {function():void} toggle
 * @property {function():void} onshow
 */

/**
 *
 * @param {HTMLElement} [activator]
 * @param {HTMLElement} [toggler]
 * @returns {HTMLElement & SideBar}
 */
function sidenav(activator, toggler) {
  let mode = innerWidth > 750 ? 'tab' : 'phone';
  const START_THRESHOLD = 20; //Point where to start swip
  const $el = tag('div', {
    id: 'sidenav',
    className: mode,
  });
  const mask = tag('span', {
    className: 'mask',
    onclick: hide,
  });
  const touch = {
    startX: 0,
    totalX: 0,
    endX: 0,
    startY: 0,
    totalY: 0,
    endY: 0,
    target: null,
  };
  let width = 250,
    eventAddedFlag = 0,
    _innerWidth = innerWidth,
    openedFolders = [],
    flag = false,
    isScrolling = false,
    scrollTimeout = null;
  activator = activator || app;

  if (toggler) toggler.addEventListener('click', toggle);

  if (mode === 'phone') activator.addEventListener('touchstart', ontouchstart);

  window.addEventListener('resize', function () {
    if (_innerWidth !== innerWidth) {
      hide(true);
      _innerWidth = innerWidth;
      $el.classList.remove(mode);
      mode = innerWidth > 750 ? 'tab' : 'phone';
      $el.classList.add(mode);

      if (mode === 'phone' && !eventAddedFlag) {
        activator.addEventListener('touchstart', ontouchstart);
        eventAddedFlag = 1;
      } else if (eventAddedFlag) {
        activator.removeEventListener('touchstart', ontouchstart);
        eventAddedFlag = 0;
      }

      editorManager.controls.update();
    }
  });

  function toggle() {
    if ($el.activated) return hide(true);
    show();
  }

  function show() {
    $el.activated = true;
    $el.onclick = null;

    if (mode === 'phone') {
      $el.onshow();
      app.append($el, mask);
      $el.classList.add('show');
      document.ontouchstart = ontouchstart;

      actionStack.push({
        id: 'sidenav',
        action: hideMaster,
      });
    } else {
      root.style.marginLeft = width + 'px';
      root.style.width = `calc(100% - ${width}px)`;
      app.append($el);
      editorManager.editor.resize(true);
      editorManager.controls.update();

      $el.onclick = () => {
        if (!$el.textContent) Acode.exec('open-folder');
      };
    }

    restoreScrollPos();
    attachListner();

    onshow();
  }

  function onshow() {
    if ($el.onshow) $el.onshow.call($el);
    openFolder.updateHeight();
  }

  function restoreScrollPos() {
    openedFolders = [...$el.getAll(':scope>div>ul')];
    openedFolders.map(($) => {
      const scrollTop = $.getAttribute('scroll-pos');
      if (scrollTop) $.scrollTop = scrollTop;
      return $;
    });
  }

  function attachListner() {
    openedFolders.map(($) => {
      $.onscroll = function () {
        isScrolling = true;
        if (flag) {
          flag = false;
          resetState();
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 100);
        this.setAttribute('scroll-pos', this.scrollTop);
      };
    });
  }

  function hide(hideIfTab = false) {
    if (mode === 'phone') {
      actionStack.remove('sidenav');
      hideMaster();
    } else if (hideIfTab) {
      $el.activated = false;
      root.style.removeProperty('margin-left');
      root.style.removeProperty('width');
      $el.remove();
      editorManager.editor.resize(true);
      editorManager.controls.update();
    }
  }

  function hideMaster() {
    $el.style.transform = null;
    $el.classList.remove('show');
    setTimeout(() => {
      $el.activated = false;
      mask.remove();
      $el.remove();
      activator.style.overflow = null;
    }, 300);
    document.ontouchstart = null;
    resetState();

    openedFolders.map(($) => ($.onscroll = null));
    openedFolders = [];
  }

  /**
   *
   * @param {TouchEvent} e
   */
  function ontouchstart(e) {
    if (isScrolling) return;
    const { clientX, clientY } = e.touches[0];
    $el.style.transition = 'none';
    touch.startX = clientX;
    touch.startY = clientY;
    touch.target = e.target;

    if ($el.activated && !$el.contains(e.target) && e.target !== mask) return;
    else if (
      (!$el.activated && touch.startX > START_THRESHOLD) ||
      e.target === toggler
    )
      return;

    document.addEventListener('touchmove', ontouchmove, {
      passive: false,
    });
    document.ontouchend = ontouchend;
  }

  /**
   *
   * @param {TouchEvent} e
   */
  function ontouchmove(e) {
    e.preventDefault();

    const [{ clientX, clientY }, scroll] = [
      e.touches[0],
      touch.target.getParent('.scroll'),
    ];
    touch.endX = clientX;
    touch.endY = clientY;
    touch.totalX = touch.endX - touch.startX;
    touch.totalY = touch.endY - touch.startY;

    if (!flag) {
      flag = true;
      const scrollLeft = () =>
        scroll.scrollBy({
          left: -touch.totalX,
        });
      const scrollTop = () =>
        scroll.scrollBy({
          top: -touch.totalY,
        });
      if (scroll) {
        if (Math.abs(touch.totalX) > Math.abs(touch.totalY)) {
          if (
            (touch.totalX > 0 && scroll.scrollLeft > 0) ||
            (touch.totalX < 0 &&
              Math.round(scroll.scrollWidth - scroll.scrollLeft) >
                scroll.clientWidth)
          )
            scrollLeft();
        } else {
          if (
            (touch.totalY > 0 && scroll.scrollTop > 0) ||
            (touch.totalY < 0 &&
              Math.round(scroll.scrollHeight - scroll.scrollTop) >
                scroll.clientHeight)
          )
            scrollTop();
        }

        return;
      }
    }

    let width = $el.getwidth();

    if (
      !$el.activated &&
      touch.totalX < width &&
      touch.startX < START_THRESHOLD
    ) {
      if (!$el.isConnected) {
        app.append($el, mask);
        activator.style.overflow = 'hidden';
        restoreScrollPos();
      }

      $el.style.transform = `translate3d(${-(width - touch.totalX)}px, 0, 0)`;
    } else if (touch.totalX < 0 && $el.activated) {
      $el.style.transform = `translate3d(${touch.totalX}px, 0, 0)`;
    }
  }

  /**
   *
   * @param {TouchEvent} e
   */
  function ontouchend(e) {
    flag = false;

    if (e.target === $el && !$el.textContent && touch.totalX === 0) {
      Acode.exec('open-folder');
      resetState();
      return hide();
    } else if (e.target !== mask && touch.totalX === 0) return resetState();
    else if (e.target === mask && touch.totalX === 0) return hide();
    e.preventDefault();

    const threshold = $el.getwidth() / 3;

    if (
      ($el.activated && touch.totalX > -threshold) ||
      (!$el.activated && touch.totalX >= threshold)
    ) {
      lclShow();
    } else if (
      (!$el.activated && touch.totalX < threshold) ||
      ($el.activated && touch.totalX <= -threshold)
    ) {
      hide();
    }

    function lclShow() {
      attachListner();
      onshow();
      $el.activated = true;
      $el.style.transform = `translate3d(0, 0, 0)`;
      document.ontouchstart = ontouchstart;
      actionStack.remove('sidenav');
      actionStack.push({
        id: 'sidenav',
        action: hideMaster,
      });
      resetState();
    }
  }

  function resetState() {
    touch.totalY = 0;
    touch.startY = 0;
    touch.endY = 0;
    touch.totalX = 0;
    touch.startX = 0;
    touch.endX = 0;
    touch.target = null;
    document.removeEventListener('touchmove', ontouchmove, {
      passive: false,
    });
    document.ontouchend = null;
    $el.style.transition = null;
  }

  $el.getwidth = function () {
    const width = innerWidth * 0.7;
    return mode === 'phone' ? (width >= 350 ? 350 : width) : 250;
  };

  $el.hide = hide;
  $el.toggle = toggle;
  $el.onshow = () => {};

  return $el;
}

export default sidenav;
