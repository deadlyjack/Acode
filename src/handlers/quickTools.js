import tag from 'html-tag-js';
import mustache from 'mustache';
import $_searchRow1 from '../views/footer/searchRow1.hbs';
import $_searchRow2 from '../views/footer/searchRow2.hbs';
import $_row1 from '../views/footer/row1.hbs';
import $_row2 from '../views/footer/row2.hbs';
import searchSettings from '../settings/searchSettings';
import constants from '../lib/constants';
import appSettings from '../lib/settings';
import commandPallete from '../components/commandPallete';

/**@type {HTMLElement} */
const $quickToolToggler = <span
  onclick={() => actions('toggle-quick-tools')}
  className='floating icon keyboard_arrow_up'
  id='quicktool-toggler'></span>;
/**@type {HTMLElement} */
const $footer = <footer id='quick-tools' tabIndex={-1}></footer>;

const $row1 = tag.parse($_row1);
const $row2 = tag.parse($_row2);
const $save = $row1.get('[action=save]');
/**@type {HTMLElement} */
let $searchRow1;
/**@type {HTMLElement} */
let $searchRow2;

export {
  actions,
  $quickToolToggler,
  $footer,
  $save,
};

/**
 * Performs quick actions
 * @param {string} action 
 * @param {string} value 
 */
function actions(action, value) {
  const { editor, activeFile } = editorManager;
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
      commandPallete();
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

    case 'set-quick-tools-height':
      setQuickToolsHeight(value);
      break;

    default:
      break;
  }

  function toggleSearch() {
    if (!$footer.contains($searchRow1)) {
      const { className } = $quickToolToggler;
      $quickToolToggler.className = 'floating icon clearclose';
      const $content = [...$footer.children];
      const footerHeight = getFooterHeight();
      setFooterHeight(0);
      $footer.content = [$searchRow1, $searchRow2];
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
          removeSearch();
          $footer.content = $content;
          $quickToolToggler.className = className;
          setFooterHeight(footerHeight);
        },
      });
    } else {
      const inputValue = $searchInput?.value || '';
      const copyValue = editor.getCopyText();
      if (inputValue !== copyValue) {
        $searchInput.value = copyValue;
        $searchInput.focus();
        find(false, false);
        return;
      }

      removeSearch();
    }
    editor.resize(true);
  }

  function toggleQuickTools() {
    const back = actionStack.get('search-bar');
    if (back?.action) {
      back.action();
      return;
    }

    if (!$footer.contains($row1)) {
      setQuickToolsHeight();
    } else if (!$footer.contains($row2)) {
      setQuickToolsHeight(2);
    } else {
      setQuickToolsHeight(0);
    }
  }

  function setQuickToolsHeight(height = 1) {
    setFooterHeight(height);
    appSettings.update({ quickTools: height }, false);
    editor.resize(true);

    if (!height) {
      $row1.remove();
      $row2.remove();
      return;
    }

    if (height >= 1) {
      $row1.style.scrollBehavior = 'unset';
      $footer.append($row1);
      $row1.scrollLeft = parseInt(localStorage.quickToolRow1ScrollLeft, 10);
      --height;
    }

    if (height >= 1) {
      $row2.style.scrollBehavior = 'unset';
      $footer.append($row2);
      $row2.scrollLeft = parseInt(localStorage.quickToolRow2ScrollLeft, 10);
      --height;
    }
  }

  function removeSearch() {
    if (!$footer.contains($searchRow1)) return;
    actionStack.remove('search-bar');
    $footer.removeAttribute('data-searching');
    $searchRow1.remove();
    $searchRow2.remove();
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
      ...searchSettings,
      backwards: backward,
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

function incFooterHeightBy(factor) {
  const footerHeight = parseInt(root.getAttribute('footer-height')) || 0;
  const height = footerHeight + factor;
  setFooterHeight(height);
}

function setFooterHeight(height) {
  if (height) root.setAttribute('footer-height', height);
  else root.removeAttribute('footer-height');

  if ($quickToolToggler.classList.contains('clearclose')) return;

  if (height > 1 && !$footer.contains($searchRow1)) {
    $quickToolToggler.classList.remove('keyboard_arrow_up');
    $quickToolToggler.classList.add('keyboard_arrow_down');
  } else {
    $quickToolToggler.classList.remove('keyboard_arrow_down');
    $quickToolToggler.classList.add('keyboard_arrow_up');
  }
}

function getFooterHeight() {
  return parseInt(root.getAttribute('footer-height')) || 0;
}
