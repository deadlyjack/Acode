import tag from 'html-tag-js';

/**
 * @typedef {object} contextMenuObj
 * @property {function():void} hide hides the menu
 * @property {function():void} show shows the page
 */

/**
 * @typedef {object} contextMenuOptions
 * @property {number} left
 * @property {number} top
 * @property {number} bottom
 * @property {number} right
 * @property {string} transformOrigin
 * @property {HTMLElement} toggle
 * @property {function} onshow
 * @property {function} onhide
 * @property {function(this:HTMLElement):string} innerHTML
 */

/**
 *
 * @param {string|contextMenuOptions} arg1
 * @param {contextMenuOptions} [arg2]
 * @returns {HTMLElement & contextMenuObj}
 */
function contextMenu(arg1, arg2) {
  if (!arg2 && typeof arg1 === 'object') {
    arg2 = arg1;
    arg1 = null;
  } else if (!arg2) {
    arg2 = {};
  }

  const $el = tag('ul', {
    className: 'context-menu scroll',
    innerHTML: arg1 || '',
    style: {
      top: arg2.top || 'auto',
      left: arg2.left || 'auto',
      right: arg2.right || 'auto',
      bottom: arg2.bottom || 'auto',
      transformOrigin: arg2.transformOrigin || null,
    },
  });
  const $mask = tag('span', {
    className: 'mask',
    ontouchstart: hide,
    onmousedown: hide,
  });

  if (!arg2.innerHTML) addTabindex();

  function show() {
    actionStack.push({
      id: 'main-menu',
      action: hide,
    });
    $el.onshow();
    $el.classList.remove('hide');

    if (arg2.innerHTML) {
      $el.innerHTML = arg2.innerHTML.call($el);
      addTabindex();
    }

    if (arg2.toggle) {
      const client = arg2.toggle.getBoundingClientRect();
      if (!arg2.top && !arg2.bottom) $el.style.top = client.top + 'px';
      if (!arg2.left && !arg2.right)
        $el.style.right = innerWidth - client.right + 'px';
    }

    document.body.append($el, $mask);

    const $firstChild = $el.firstChild;
    if ($firstChild && $firstChild.focus) $firstChild.focus();
  }

  function hide() {
    actionStack.remove('main-menu');
    $el.onhide();
    $el.classList.add('hide');
    setTimeout(() => {
      $mask.remove();
      $el.remove();
    }, 100);
  }

  function toggle() {
    if ($el.parentElement) return hide();
    show();
  }

  function addTabindex() {
    /**@type {Array<HTMLLIElement>} */
    const children = [...$el.children];
    for (let $el of children) $el.tabIndex = '0';
  }

  if (arg2.toggle) arg2.toggle.addEventListener('click', toggle);

  $el.hide = hide;
  $el.show = show;
  $el.onshow = arg2.onshow || (() => {});
  $el.onhide = arg2.onhide || (() => {});

  return $el;
}

export default contextMenu;
