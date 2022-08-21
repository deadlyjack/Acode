import tag from 'html-tag-js';
import helpers from '../utils/helpers';

/**
 *
 * @param {HTMLUListElement|HTMLOListElement} $list
 * @param {(hide:()=>)=>void} setHide
 */
function searchBar($list, setHide) {
  let hideOnBlur = true;
  const $searchInput = tag('input', {
    type: 'search',
    placeholder: strings.search,
  });
  const $container = tag('div', {
    id: 'search-bar',
    children: [
      $searchInput,
      tag('span', {
        className: 'icon clearclose',
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          hide();
        },
      }),
    ],
  });
  const children = [...$list.children];

  if (typeof setHide === 'function') {
    hideOnBlur = false;
    setHide(() => {
      $container.remove();
      actionStack.remove('searchbar');
      restoreList(); // resotre list items when searchbar is hidden
    });
  }
  app.appendChild($container);
  $searchInput.oninput = search;
  $searchInput.focus();
  $searchInput.onblur = () => {
    if (hideOnBlur) {
      setTimeout(() => {
        hide();
      }, 0);
    }
  };

  actionStack.push({
    id: 'searchbar',
    action: hideSearchBar,
  });

  function hide() {
    actionStack.remove('searchbar');
    hideSearchBar();
  }

  function hideSearchBar() {
    onhide();
    $container.classList.add('hide');
    setTimeout(() => {
      $container.remove();
    }, 300);
  }

  /**
   * @this {HTMLInputElement}
   */
  function search() {
    const val = helpers.removeLineBreaks(this.value).toLowerCase();
    const result = [];

    children.map((child) => {
      const text = child.textContent.toLowerCase();
      if (text.match(val, 'i')) result.push(child);
    });

    $list.textContent = '';
    $list.append(...result);
  }

  function onhide() {
    if (!$list.parentElement) return;
    restoreList();
  }

  function restoreList() {
    $list.textContent = '';
    $list.append(...children);
  }
}

export default searchBar;
