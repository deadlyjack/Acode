import './style.scss';

/**@type {HTMLElement} */
let container = null;

export default [
  'documents',
  'files',
  strings['files'],
  (/**@type {HTMLElement} */ el) => {
    container = el;
    container.classList.add('files');
    container.setAttribute('data-msg', strings['open folder']);
    container.addEventListener('click', clickHandler);
  }
];

export const fixFilesHeight = fixHeight;

function clickHandler(e) {
  if (!container.children.length) {
    acode.exec('open-folder');
    return;
  }

  fixHeight(e.target);
}

/**
 * Update list height
 * @param {HTMLElement} e 
 */
function fixHeight(target) {
  if (target.matches('.files>.list>.tile')) {
    target = target.parentElement;
  } else if (!target.matches('.files>.list')) {
    return;
  }
  const lists = [...container.getAll(':scope > div')];

  let height = 0;
  lists.forEach((list) => {
    if (list === target) return;
    list.collapse?.();
    list.style.removeProperty('height');
    height += list.offsetHeight;
  });

  target.style.maxHeight = `calc(100% - ${height}px)`;
}
