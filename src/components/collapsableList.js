import tag from 'html-tag-js';
import tile from './tile';

/**
 * @typedef {object} Collaspable
 * @property {HTMLElement} $title
 * @property {HTMLUListElement} $ul
 * @property {function(void):void} ontoggle
 * @property {function(void):void} collapse
 * @property {function(void):void} uncollapse
 * @property {boolean} collapsed
 * @property {boolean} uncollapsed
 */

/**
 *
 * @param {string} titleText
 * @param {boolean} hidden
 * @param {"indicator"|"folder"} type
 * @param {object} [options]
 * @param {HTMLElement} [options.tail]
 * @param {string} [options.type]
 * @param {boolean} [options.allCaps]
 * @param {function(this:Collaspable):void} [options.ontoggle]
 * @returns {HTMLElement & Collaspable}
 */
function collapsableList(titleText, hidden, type = 'indicator', options = {}) {
  const $ul = tag('ul', {
    className: 'scroll',
  });
  const $collaspeIndicator = tag('span', {
    className: `icon ${type}`,
  });
  const $title = tile({
    lead: $collaspeIndicator,
    type: 'div',
    text: options.allCaps ? titleText.toUpperCase() : titleText,
    tail: options.tail,
  });
  const $mainWrapper = tag(options.type || 'div', {
    className: 'list collaspable hidden',
    children: [$title, $ul],
  });

  $title.classList.add('light');
  $title.addEventListener('click', toggle);

  if (!hidden) setTimeout(toggle, 0);

  function toggle() {
    if ($title.collapsed) {
      uncollapse();
    } else {
      collapse();
    }
  }

  function collapse() {
    $mainWrapper.classList.add('hidden');
    if ($mainWrapper.ontoggle) $mainWrapper.ontoggle.call($mainWrapper);
  }

  function uncollapse() {
    $mainWrapper.classList.remove('hidden');
    if ($mainWrapper.ontoggle) $mainWrapper.ontoggle.call($mainWrapper);
  }

  [$title, $mainWrapper].forEach(defineProperties);

  return $mainWrapper;

  function defineProperties($el) {
    Object.defineProperties($el, {
      $title: {
        get() {
          return $title;
        },
      },
      $ul: {
        get() {
          return $ul;
        },
      },
      ontoggle: {
        get() {
          return options.ontoggle;
        },
        set(fun) {
          if (typeof fun === 'function') options.ontoggle = fun;
        },
      },
      collapse: {
        get() {
          return collapse || (() => { });
        },
        set(fun) {
          if (typeof fun === 'function') collapse = fun;
        },
      },
      uncollapse: {
        get() {
          return uncollapse || (() => { });
        },
        set(fun) {
          if (typeof fun === 'function') uncollapse = fun;
        },
      },
      collapsed: {
        get() {
          return $mainWrapper.classList.contains('hidden');
        }
      },
      uncollapsed: {
        get() {
          return !this.collapsed;
        }
      },
    })
  }
}

export default collapsableList;
