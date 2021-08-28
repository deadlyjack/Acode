//#region Imports
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';

import _template from './modes.hbs';
import _list from './list.hbs';
import './modes.scss';
import searchBar from '../../components/searchbar';
//#endregion

function Modes() {
  const actionStack = window.actionStack;
  return new Promise((resolve, reject) => {
    //#region Declaration
    const $search = tag('i', {
      className: 'icon search',
      attr: {
        action: 'search',
      },
    });
    const $page = Page(strings['syntax highlighting']);
    const $content = tag.parse(_template);
    const modes = modelist.modes;
    const $list = tag.parse(
      mustache.render(_list, {
        modes,
      })
    );
    //#endregion

    $page.addEventListener('click', handleClick);
    $page.append($content);
    $page.querySelector('header').append($search);
    document.body.append($page);

    setTimeout(() => {
      $content.append($list);
    }, 300);

    actionStack.push({
      id: 'modes',
      action: function () {
        $page.hide();
      },
    });

    $search.onclick = function () {
      const $list = $content.get('#list');
      if ($list) searchBar($list);
    };

    $page.onhide = function () {
      actionStack.remove('modes');
      $content.removeEventListener('click', handleClick);
    };

    /**
     *
     * @param {MouseEvent} e
     */
    function handleClick(e) {
      /**
       * @type {HTMLElement}
       */
      const $el = e.target;
      let action = $el.getAttribute('action');
      if (!action) return;

      if (action === 'search') {
        searchBar($list);
      } else if (action === 'select') {
        const mode = $el.getAttribute('mode');
        resolve(mode);
        $page.hide();
      }
    }
  });
}

export default Modes;
