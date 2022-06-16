import tag from 'html-tag-js';
import tile from './tile';

/**
 * @typedef {object} PageObj
 * @property {function(String):void} settitle sets title of the page
 * @property {import('./tile').Tile} header header of the page
 * @property {function():void} hide hides the page
 * @property {function():void} onhide executes on page hide event
 */

/**
 *
 * @param {string} title
 * @param {object} options
 * @param {HTMLElement} [options.lead] type of page
 * @param {HTMLElement} [options.tail] type of page
 * @returns {HTMLDivElement & PageObj}
 */
function Page(title, options = {}) {
  const leadBtn =
    options.lead ||
    tag('span', {
      className: 'icon arrow_back',
      onclick: hide,
      attr: {
        action: 'go-back',
      },
    });
  const $header = tile({
    type: 'header',
    text: title,
    lead: leadBtn,
    tail: options.tail || undefined,
  });
  const $page = tag('div', {
    className: 'page',
    child: $header,
  });
  let onhide;

  if (!window.$placeholder) {
    window.$placeholder = tag('div', {
      style: {
        display: 'none',
      },
    });
  }

  if (!window.pageCount) window.pageCount = 0;
  // if (!pageCount++) document.body.replaceChild($placeholder, root);

  $header.classList.add('light');

  Object.defineProperties($page, {
    onhide: {
      get() {
        return onhide;
      },
      set(cb) {
        onhide = cb;
      },
    },
    hide: {
      value: hide,
    },
    settitle: {
      value(text) {
        $header.text = text;
      },
    },
    header: {
      get() {
        return $header;
      },
    },
    innerHTML: {
      set(html) {

        [...$page.children].forEach($i => {
          if ($i && $i !== $header && !$i?.classList?.contains('main')) $i?.remove();
        });

        const $main = $page.querySelector('.main');
        const $content = tag.parse(html);
        if ($content?.classList?.contains('main')) {
          if ($main) {
            $main.replaceWith($content);
            return;
          }
          $page.append($content);
        } else {
          if ($main) {
            $main.innerHTML = html;
            return;
          }

          $page.append(tag('div', {
            className: 'main',
            child: $content,
          }));
        }
      },
      get() {
        return $page.querySelector('main').innerHTML;
      }
    }
  });
  return $page;

  function hide() {
    if (!--pageCount) {
      // document.body.replaceChild(root, $placeholder);
      editorManager.editor.resize(true);
    }
    if ($page.isConnected) {
      if (typeof onhide === 'function') onhide.call($page);
      $page.classList.add('hide');
      setTimeout(() => {
        $page.remove();
      }, 150);
    }
  }
}

export default Page;
