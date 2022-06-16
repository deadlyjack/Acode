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
 * @param {HTMLElement} [$activator]
 * @param {HTMLElement} [toggler]
 * @returns {HTMLElement & SideBar}
 */
function sidenav($activator, toggler) {
  let { innerWidth } = window;

  const START_THRESHOLD = 20; //Point where to start swip
  const MIN_WIDTH = 250; //Min width of the side bar
  const MAX_WIDTH = () => innerWidth * 0.7; //Max width of the side bar

  $activator = $activator || app;
  let mode = innerWidth > 750 ? 'tab' : 'phone';
  let width = +(localStorage.sideBarWidth || MIN_WIDTH);
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
  const $resizeBar = tag('div', {
    className: 'w-resize',
    onmousedown: onresize,
    ontouchstart: onresize,
    style: {
      position: 'fixed',
      top: 0,
      left: width + 'px',
      height: '100vh',
      width: '5px',
      marginLeft: '-2.5px',
      zIndex: 110,
    }
  });
  let openedFolders = [];
  let flag = false;
  let isScrolling = false;
  let scrollTimeout = null;
  let resizeTimeout = null;
  let setWidthTimeout = null;

  toggler?.addEventListener('click', toggle);
  $activator.addEventListener('touchstart', ontouchstart);
  window.addEventListener('resize', onWindowResize);

  if (mode === 'tab' && localStorage.sidebarShown === '1') {
    show();
  }

  function onWindowResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const { innerWidth: currentWidth } = window;
      if (innerWidth === currentWidth) return;
      hide(true);
      innerWidth = currentWidth;
      $el.classList.remove(mode);
      mode = innerWidth > 750 ? 'tab' : 'phone';
      $el.classList.add(mode);
      editorManager.controls.update();
    }, 300);
  }

  function toggle() {
    if ($el.activated) return hide(true);
    show();
  }

  function show() {
    localStorage.sidebarShown = 1;
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
      setWidth(width);
      app.append($el, $resizeBar);
      $el.onclick = () => {
        if (!$el.textContent) acode.exec('open-folder');
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
    localStorage.sidebarShown = 0;
    if (mode === 'phone') {
      actionStack.remove('sidenav');
      hideMaster();
    } else if (hideIfTab) {
      $el.activated = false;
      root.style.removeProperty('margin-left');
      root.style.removeProperty('width');
      $resizeBar.remove();
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
      $activator.style.overflow = null;
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
    const { clientX, clientY } = getClient(e);

    if (mode === 'tab') return;
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
   * @param {MouseEvent | TouchEvent} e 
   * @returns 
   */
  function onresize(e) {
    const { clientX } = getClient(e);
    let deltaX = 0;
    const onMove = (e) => {
      const { clientX: currentX } = getClient(e);
      deltaX = currentX - clientX;
      resize(deltaX);
    };
    const onEnd = () => {
      const newWidth = width + deltaX;
      if (newWidth <= MIN_WIDTH) width = MIN_WIDTH;
      else if (newWidth >= MAX_WIDTH()) width = MAX_WIDTH();
      else width = newWidth;
      localStorage.sideBarWidth = width;
      document.ontouchmove = null;
      document.onmousemove = null
      document.ontouchend = null;
      document.onmouseup = null;
      document.onmouseout = null;
      document.onmouseleave = null;
    };
    document.ontouchmove = onMove;
    document.onmousemove = onMove
    document.ontouchend = onEnd;
    document.onmouseup = onEnd;
    document.onmouseleave = onEnd;
    return;
  }

  function resize(deltaX) {
    const newWidth = width + deltaX;
    if (newWidth >= MAX_WIDTH()) return;
    if (newWidth <= MIN_WIDTH) return;
    setWidth(newWidth);
  }

  /**
   *
   * @param {TouchEvent} e
   */
  function ontouchmove(e) {
    e.preventDefault();

    const [{ clientX, clientY }, scroll] = [
      getClient(e),
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
        $activator.style.overflow = 'hidden';
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
      acode.exec('open-folder');
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

  function setWidth(width) {
    root.style.marginLeft = width + 'px';
    $el.style.maxWidth = width + 'px';
    root.style.width = `calc(100% - ${width}px)`;
    clearTimeout(setWidthTimeout);
    setWidthTimeout = setTimeout(() => {
      editorManager?.editor?.resize(true);
      editorManager?.controls?.update();
      $resizeBar.style.left = width + 'px';
    }, 300);
  }

  /**
   * 
   * @param {TouchEvent | MouseEvent} e 
   * @returns {{clientX: number, clientY: number}}
   */
  function getClient(e) {
    const { clientX, clientY } = (e.touches ?? [])[0] ?? e;
    return { clientX, clientY };
  }

  $el.getwidth = function () {
    const width = innerWidth * 0.7;
    return mode === 'phone' ? (width >= 350 ? 350 : width) : MIN_WIDTH;
  };

  $el.hide = hide;
  $el.toggle = toggle;
  $el.onshow = () => { };

  return $el;
}

export default sidenav;
