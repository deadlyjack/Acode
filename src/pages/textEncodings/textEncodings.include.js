import './textEncodings.scss';

import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';

import _template from './textEncodings.hbs';
import _list from './list.hbs';
import searchBar from '../../components/searchbar';
import constants from '../../lib/constants';

function TextEncodings() {
  return new Promise((resolve) => {
    //#region Declaration
    const { encodings } = constants;
    const $search = tag('i', {
      className: 'icon search',
      dataset: {
        action: 'search',
      },
    });
    const $page = Page(strings.encoding);
    const $content = tag.parse(_template);
    const $list = tag.parse(
      mustache.render(_list, {
        encodings
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
      id: 'encodings',
      action: function () {
        $page.hide();
      },
    });

    $page.onhide = function () {
      actionStack.remove('encodings');
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
      const $target = e.target;
      const { action, encoding } = $target.dataset;
      if (!action) return;

      if (action === 'search') {
        searchBar($list);
      } else if (action === 'select') {
        resolve(encoding);
        $page.hide();
      }
    }
  });
}

export default TextEncodings;
