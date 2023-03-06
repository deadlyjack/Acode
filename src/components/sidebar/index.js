import Ref from 'html-tag-js/ref';
import './style.scss';

let $sidebar;

/**
 * @typedef {object} SideBar
 * @property {function():void} hide
 * @property {function():void} toggle
 * @property {function():void} onshow
 */

/**
 *
 * @param {HTMLElement} [$container]
 * @param {HTMLElement} [$toggler]
 * @returns {HTMLElement & SideBar}
 */
function create($container, $toggler) {
  let { innerWidth } = window;

  const START_THRESHOLD = 20; //Point where to start swip
  const MIN_WIDTH = 200; //Min width of the side bar
  const MAX_WIDTH = () => innerWidth * 0.7; //Max width of the side bar
  const resizeBar = new Ref();

  $container = $container || app;
  let mode = innerWidth > 600 ? 'tab' : 'phone';
  let width = +(localStorage.sideBarWidth || MIN_WIDTH);
  const $el = <div id='sidebar' className={mode}>
    <div className='apps'></div>
    <div className='container'></div>
    <div
      className='resize-bar w-resize'
      onmousedown={onresize}
      ontouchstart={onresize}
    ></div>
  </div>;
  const mask = <span className='mask' onclick={hide}></span>;
  const touch = {
    startX: 0,
    totalX: 0,
    endX: 0,
    startY: 0,
    totalY: 0,
    endY: 0,
    target: null,
  };
  let openedFolders = [];
  let resizeTimeout = null;
  let setWidthTimeout = null;

  $toggler?.addEventListener('click', toggle);
  $container.addEventListener('touchstart', ontouchstart);
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
      resizeBar.style.display = 'none';
      $el.onshow();
      app.append($el, mask);
      $el.classList.add('show');
      document.ontouchstart = ontouchstart;

      actionStack.push({
        id: 'sidebar',
        action: hideMaster,
      });
    } else {
      setWidth(width);
      resizeBar.style.display = 'block';
      app.append($el);
      $el.onclick = () => {
        if (!$el.textContent) acode.exec('open-folder');
      };
    }
    onshow();
  }

  function onshow() {
    if ($el.onshow) $el.onshow.call($el);
  }

  function hide(hideIfTab = false) {
    localStorage.sidebarShown = 0;
    if (mode === 'phone') {
      actionStack.remove('sidebar');
      hideMaster();
    } else if (hideIfTab) {
      $el.activated = false;
      root.style.removeProperty('margin-left');
      root.style.removeProperty('width');
      $el.remove();
      editorManager.editor.resize(true);
    }
  }

  function hideMaster() {
    $el.style.transform = null;
    $el.classList.remove('show');
    setTimeout(() => {
      $el.activated = false;
      mask.remove();
      $el.remove();
      $container.style.overflow = null;
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
    const { target } = e;
    const $parent = target.closest('#sidebar>.container>.list>.scroll');
    if (
      $parent &&
      $parent.offsetHeight < $parent.scrollHeight
    ) return;

    const { clientX, clientY } = getClient(e);

    if (mode === 'tab') return;
    $el.style.transition = 'none';
    touch.startX = clientX;
    touch.startY = clientY;
    touch.target = e.target;

    if ($el.activated && !$el.contains(e.target) && e.target !== mask) return;
    else if (
      (!$el.activated && touch.startX > START_THRESHOLD) ||
      e.target === $toggler
    )
      return;

    document.addEventListener('touchmove', ontouchmove);
    document.addEventListener('touchend', ontouchend);
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

    const { clientX, clientY } = getClient(e);
    touch.endX = clientX;
    touch.endY = clientY;
    touch.totalX = touch.endX - touch.startX;
    touch.totalY = touch.endY - touch.startY;

    let width = $el.getwidth();

    if (
      !$el.activated &&
      touch.totalX < width &&
      touch.startX < START_THRESHOLD
    ) {
      if (!$el.isConnected) {
        app.append($el, mask);
        $container.style.overflow = 'hidden';
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
    if (e.target !== mask && touch.totalX === 0) return resetState();
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
      onshow();
      $el.activated = true;
      $el.style.transform = `translate3d(0, 0, 0)`;
      document.ontouchstart = ontouchstart;
      actionStack.remove('sidebar');
      actionStack.push({
        id: 'sidebar',
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
    $el.style.transition = null;
    document.removeEventListener('touchmove', ontouchmove);
    document.removeEventListener('touchend', ontouchend);
  }

  function setWidth(width) {
    $el.style.transition = 'none';
    $el.style.maxWidth = width + 'px';
    root.style.marginLeft = width + 'px';
    root.style.width = `calc(100% - ${width}px)`;
    clearTimeout(setWidthTimeout);
    setWidthTimeout = setTimeout(() => {
      editorManager?.editor?.resize(true);
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

  $el.show = show;
  $el.hide = hide;
  $el.toggle = toggle;
  $el.onshow = () => { };

  return $el;
}

/**
 *
 * @param {object} [arg0] - the element that will activate the sidebar
 * @param {HTMLElement} [arg0.container] - the element that will contain the sidebar
 * @param {HTMLElement} [arg0.toggler] - the element that will toggle the sidebar
 * @returns {HTMLElement & SideBar}
 */
function Sidebar({ container, toggler }) {
  $sidebar = $sidebar ?? create(container, toggler);
  return $sidebar;
}

Sidebar.hide = () => $sidebar?.hide();
Sidebar.show = () => $sidebar?.show();
Sidebar.toggle = () => $sidebar?.toggle();
/**@type {HTMLElement} */
Sidebar.el = null;

Object.defineProperty(Sidebar, 'el', {
  get() {
    return $sidebar;
  }
});

export default Sidebar;
