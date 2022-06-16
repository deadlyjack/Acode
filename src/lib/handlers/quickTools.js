import tag from 'html-tag-js';
import mustache from 'mustache';
import $_search from '../../views/footer/search.hbs';
import $_row1 from '../../views/footer/row1.hbs';
import $_row2 from '../../views/footer/row2.hbs';
import searchSettings from '../../pages/settings/searchSettings';

/**
 * Performs quick actions
 * @param {string} action 
 * @param {string} value 
 */
function actions(action, value) {
  const search = mustache.render($_search, strings);
  const $footer = root.get('#quick-tools');
  const editor = editorManager.editor;
  const $row2 = $footer.querySelector('#row2');
  const $searchRow1 = $footer.querySelector('#search_row1');
  const $searchRow2 = $footer.querySelector('#search_row2');
  const $textarea = editor.textInput.getElement();
  let $searchInput = $footer.querySelector('#searchInput'),
    $replaceInput = $footer.querySelector('#replaceInput'),
    state,
    selectedText = editor.getCopyText();

  if (selectedText.length > 50) selectedText = '';

  if (
    !['pallete', 'search', 'search-settings'].includes(action) &&
    editorManager.state === 'focus'
  )
    editor.focus();

  switch (action) {
    case 'key':
      editor.insert(value);
      break;
    case 'pallete':
      acode.exec('command-pallete');
      break;

    case 'tab':
      const shiftKey =
        $footer.querySelector('#shift-key').getAttribute('data-state') === 'on'
          ? true
          : false;
      $textarea.dispatchEvent(
        window.createKeyboardEvent('keydown', {
          key: 9,
          keyCode: 9,
          shiftKey,
        }),
      );
      break;

    case 'shift':
      const $el = $footer.querySelector('#shift-key');
      state = $el.getAttribute('data-state') || 'off';
      if (state === 'off') {
        $textarea.dispatchEvent(window.createKeyboardEvent('keydown', {}));
        $el.setAttribute('data-state', 'on');
        $el.classList.add('active');
      } else {
        $textarea.dispatchEvent(window.createKeyboardEvent('keyup', {}));
        $el.setAttribute('data-state', 'off');
        $el.classList.remove('active');
      }
      break;

    case 'undo':
      editor.undo(true);
      break;

    case 'redo':
      editor.redo(true);
      break;

    case 'search':
      initSearch();
      break;

    case 'save':
      acode.exec('save');
      break;

    case 'more':
      if (!$row2) {
        if ($searchRow1) {
          removeSearchRow2();
        }
        moreIconDown();
        $footer.appendChild(tag.parse($_row2));
        incFooterHeightBy(1);
      } else {
        removeRow2();
      }
      resizeEditor();
      break;

    case 'moveline-up':
      editor.moveLinesUp();
      break;

    case 'moveline-down':
      editor.moveLinesDown();
      break;

    case 'copyline-up':
      editor.copyLinesUp();
      break;

    case 'copyline-down':
      editor.copyLinesDown();
      break;

    case 'next':
      find(true, false);
      break;

    case 'prev':
      find(true, true);
      break;

    case 'replace':
      editor.replace($replaceInput.value || '');
      break;

    case 'replace-all':
      editor.replaceAll($replaceInput.value || '');
      break;

    case 'search-settings':
      editor.blur();
      searchSettings();
      break;

    case 'toggle-quick-tools':
      toggleQuickTools();
      break;

    case 'enable-quick-tools':
      enableQuickTools();
      break;

    case 'diable-quick-tools':
      disableQuickTools();
      break;
  }

  function initSearch() {
    if (!$searchRow1) {
      if ($row2) {
        removeRow2();
      }
      $footer.append(...tag.parse(search));
      if (!$searchInput) $searchInput = $footer.querySelector('#searchInput');
      $searchInput.value = selectedText || '';
      if (!selectedText) $searchInput.focus();
      $searchInput.oninput = function () {
        if (this.value) find(false, false);
      };
      incFooterHeightBy(2);
      find(false, false);

      actionStack.push({
        id: 'search-bar',
        action: () => {
          actions('search');
        },
      });
    } else {
      removeSearchRow2();
    }
    resizeEditor();
  }

  function toggleQuickTools() {
    appSettings.value.quickTools = !appSettings.value.quickTools;
    appSettings.update(false);

    if (appSettings.value.quickTools) {
      enableQuickTools();
    } else {
      disableQuickTools();
    }
  }

  function enableQuickTools() {
    if (root.hasAttribute('quicktools')) return; //Quicktools is already enabled

    let quickToolsState = parseInt(localStorage.quickToolsState) || 1;
    const $row1 = tag.parse($_row1);
    const $row2 = tag.parse($_row2);

    if (quickToolsState > 2) quickToolsState = 1;

    if (quickToolsState == 2) {
      $footer.append($row1, $row2);
      moreIconDown();
    } else {
      $footer.append($row1);
    }

    if (localStorage.quickToolRow1ScrollLeft) {
      $row1.scrollLeft = parseInt(localStorage.quickToolRow1ScrollLeft);
    }

    if (localStorage.quickToolRow2ScrollLeft) {
      $row2.scrollLeft = parseInt(localStorage.quickToolRow2ScrollLeft);
    }

    root.setAttribute('quicktools', 'enabled');
    incFooterHeightBy(quickToolsState);
    if (editorManager.activeFile && editorManager.activeFile.isUnsaved) {
      $row1.querySelector("[action='save']").classList.add('notice');
    }
    resizeEditor();
  }

  function disableQuickTools() {
    const height = root.getAttribute('footer-height');
    let $row1 = $footer.querySelector('#row1');
    let $row2 = $footer.querySelector('#row2');
    localStorage.quickToolsState = height;
    if ($row1) {
      localStorage.quickToolRow1ScrollLeft = $row1.scrollLeft;
      $row1.remove();
      incFooterHeightBy(-1);
    }
    if ($row2) {
      localStorage.quickToolRow2ScrollLeft = $row2.scrollLeft;
      $row2.remove();
      incFooterHeightBy(-1);
    }

    root.removeAttribute('quicktools');
    resizeEditor();
  }

  function removeRow2() {
    $footer.removeChild($row2);
    incFooterHeightBy(-1);
    moreIconUp();
  }

  function moreIconUp() {
    $footer
      .get('[action=more]')
      .classList.replace('arrow_drop_down', 'arrow_drop_up');
  }
  function moreIconDown() {
    $footer
      .get('[action=more]')
      .classList.replace('arrow_drop_up', 'arrow_drop_down');
  }

  function resizeEditor() {
    editor.resize(true);
    editorManager.scroll.$vScrollbar.resize(false);
  }

  function removeSearchRow2() {
    actionStack.remove('search-bar');
    $footer.removeAttribute('data-searching');
    $footer.removeChild($searchRow1);
    $footer.removeChild($searchRow2);
    incFooterHeightBy(-2);
  }

  function find(skip, backward) {
    const searchSettings = appSettings.value.search;
    editor.find($searchInput.value, {
      skipCurrent: skip,
      backwards: backward,
      caseSensitive: searchSettings.caseSensitive,
      wrap: searchSettings.wrap,
      wholeWord: searchSettings.wholeWord,
      regExp: searchSettings.regExp,
    });

    updateStatus();
  }

  function updateStatus() {
    let regex = editor.$search.$options.re;
    let all = 0;
    let before = 0;
    const MAX_COUNT = 999;
    if (regex) {
      const value = editor.getValue();
      const offset = editor.session.doc.positionToIndex(
        editor.selection.anchor,
      );
      let last = (regex.lastIndex = 0);
      let m;
      while ((m = regex.exec(value))) {
        all++;
        last = m.index;
        if (last <= offset) before++;
        if (all > MAX_COUNT) break;
        if (!m[0]) {
          regex.lastIndex = last += 1;
          if (last >= value.length) break;
        }
      }
    }
    $footer.querySelector('#total-result').textContent =
      all > MAX_COUNT ? '999+' : all;
    $footer.querySelector('#current-pos').textContent = before;
  }
}

/**
 *
 * @param {TouchEvent | MouseEvent} e
 */
function clickListener(e) {
  if (!e.target) return;

  const el = e.target;
  const action = el.getAttribute('action');
  const value = el.getAttribute('value');

  if (!action) return;

  e.preventDefault();
  actions(action, value);
}

function incFooterHeightBy(factor) {
  const footerHeight = parseInt(root.getAttribute('footer-height')) || 0;
  const height = footerHeight + factor;
  if (height) root.setAttribute('footer-height', height);
  else root.removeAttribute('footer-height');
}

export default {
  actions,
  clickListener,
  incFooterHeightBy,
};
