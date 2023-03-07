import './modes.scss';

import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';

import _template from './modes.hbs';
import _list from './list.hbs';
import searchBar from '../../components/searchbar';

function Modes() {
  return new Promise((resolve, reject) => {
    //#region Declaration
    const { modes } = ace.require('ace/ext/modelist');
    const $search = tag('i', {
      className: 'icon search',
      attr: {
        action: 'search',
      },
    });
    const $page = Page(strings['syntax highlighting']);
    const $content = tag.parse(_template);
    const $list = tag.parse(
      mustache.render(_list, {
        modes,
      }),
    );
    //#endregion

    $page.addEventListener('click', handleClick);
    $page.body = $content;
    $page.header.append($search);
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
