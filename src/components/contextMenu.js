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
 * @param {string|contextMenuOptions} content
 * @param {contextMenuOptions} [options]
 * @returns {HTMLElement & contextMenuObj}
 */
function contextMenu(content, options) {
  if (!options && typeof content === 'object') {
    options = content;
    content = null;
  } else if (!options) {
    options = {};
  }

  const $el = tag('ul', {
    className: 'context-menu scroll',
    innerHTML: content || '',
    style: {
      top: options.top || 'auto',
      left: options.left || 'auto',
      right: options.right || 'auto',
      bottom: options.bottom || 'auto',
      transformOrigin: options.transformOrigin || null,
    },
  });
  const $mask = tag('span', {
    className: 'mask',
    ontouchstart: hide,
    onmousedown: hide,
  });

  if (!options.innerHTML) addTabindex();

  function show() {
    actionStack.push({
      id: 'main-menu',
      action: hide,
    });
    $el.onshow();
    $el.classList.remove('hide');

    if (options.innerHTML) {
      $el.innerHTML = options.innerHTML.call($el);
      addTabindex();
    }

    if (options.toggle) {
      const client = options.toggle.getBoundingClientRect();
      if (!options.top && !options.bottom) $el.style.top = client.top + 'px';
      if (!options.left && !options.right)
        $el.style.right = innerWidth - client.right + 'px';
    }

    app.append($el, $mask);

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

  if (options.toggle) options.toggle.addEventListener('click', toggle);

  $el.hide = hide;
  $el.show = show;
  $el.onshow = options.onshow || (() => {});
  $el.onhide = options.onhide || (() => {});

  return $el;
}

export default contextMenu;
