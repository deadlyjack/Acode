import actionStack from 'lib/actionStack';
import './style.scss';

/**
 *
 * @param {HTMLUListElement|HTMLOListElement} $list
 * @param {(hide:Function)=>void} setHide
 * @param {Function} onhide
 */
function searchBar($list, setHide, onhide) {
  let hideOnBlur = true;
  const $searchInput = tag('input', {
    type: 'search',
    placeholder: strings.search,
    enterKeyHint: 'go',
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
    setHide(hide);
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
    if (typeof onhide === 'function') onhide();
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
    const val = this.value.toLowerCase();
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
