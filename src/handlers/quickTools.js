import tag from 'html-tag-js';
import mustache from 'mustache';
import $_searchRow1 from '../views/footer/searchRow1.hbs';
import $_searchRow2 from '../views/footer/searchRow2.hbs';
import $_row1 from '../views/footer/row1.hbs';
import $_row2 from '../views/footer/row2.hbs';
import searchSettings from '../settings/searchSettings';
import constants from '../lib/constants';

const $row1 = tag.parse($_row1);
const $row2 = tag.parse($_row2);
let $searchRow1;
let $searchRow2;

/**
 * Performs quick actions
 * @param {string} action 
 * @param {string} value 
 */
function actions(action, value) {
  const { editor, activeFile } = editorManager;
  const $footer = root.get('#quick-tools');
  const $shiftKey = $footer.get('#shift-key');
  const $textarea = editor.textInput.getElement();
  let $searchInput = $footer.get('#searchInput');
  let $replaceInput = $footer.get('#replaceInput');
  let selectedText = editor.getCopyText();
  let state;

  if (!$searchRow1) {
    $searchRow1 = tag.parse(
      mustache.render($_searchRow1, strings),
    );

    $searchRow2 = tag.parse(
      mustache.render($_searchRow2, strings),
    );
  }

  if (selectedText.length > 50) selectedText = '';

  const ignore = !['pallete', 'search', 'search-settings'].includes(action);
  if (ignore && activeFile?.focused) {
    editor.focus();
  }

  switch (action) {
    case 'key':
      editor.insert(value);
      break;
    case 'pallete':
      acode.exec('command-pallete');
      break;

    case 'tab':
      $textarea.dispatchEvent(
        window.createKeyboardEvent('keydown', {
          key: 9,
          keyCode: 9,
          shiftKey: $shiftKey.dataset.state === 'on',
        }),
      );
      break;

    case 'shift':
      const $el = $footer.querySelector('#shift-key');
      state = $el.getAttribute('data-state') || 'off';
      if (state === 'off') {
        if (appSettings.value.vibrateOnTap) {
          navigator.vibrate(constants.VIBRATION_TIME_LONG);
        }
        $textarea.dispatchEvent(window.createKeyboardEvent('keydown', {}));
        $el.setAttribute('data-state', 'on');
        $el.classList.add('active');
      } else {
        if (appSettings.value.vibrateOnTap) {
          navigator.vibrate(constants.VIBRATION_TIME);
        }
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
      toggleSearch();
      break;

    case 'save':
      acode.exec('save');
      break;

    case 'more':
      if (!$row2.isConnected) {
        if ($searchRow1.isConnected) {
          removeSearch();
        }
        moreIconDown();
        $footer.appendChild($row2);
        incFooterHeightBy(1);
      } else {
        removeRow2();
      }
      editor.resize(true);
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

  function toggleSearch() {
    if (!$searchRow1.isConnected) {
      if ($row2.isConnected) {
        removeRow2();
      }
      $footer.append($searchRow1, $searchRow2);
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
      removeSearch();
    }
    editor.resize(true);
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
    if (quickToolsState === 1) {
      $footer.append($row1);
    } else {
      quickToolsState = 2;
      $footer.append($row1, $row2);
      moreIconDown();
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
    editor.resize(true);
  }

  function disableQuickTools() {
    const height = root.getAttribute('footer-height');
    localStorage.quickToolsState = height;
    if ($row1.isConnected) {
      localStorage.quickToolRow1ScrollLeft = $row1.scrollLeft;
      $row1.remove();
      incFooterHeightBy(-1);
    }
    if ($row2.isConnected) {
      localStorage.quickToolRow2ScrollLeft = $row2.scrollLeft;
      $row2.remove();
      incFooterHeightBy(-1);
    }
    if ($searchRow1.isConnected) {
      removeSearch();
    }

    root.removeAttribute('quicktools');
    editor.resize(true);
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

  function removeSearch() {
    actionStack.remove('search-bar');
    $footer.removeAttribute('data-searching');
    $footer.removeChild($searchRow1);
    $footer.removeChild($searchRow2);
    incFooterHeightBy(-2);
    const { editor, activeFile } = editorManager;
    if (activeFile.focused) {
      editor.focus();
    }
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
