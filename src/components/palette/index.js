import './style.scss';
import restoreTheme from 'lib/restoreTheme';
import inputhints from 'components/inputhints';

/**
 * @typedef {import('./inputhints').HintCallback} HintCallback
 * @typedef {import('./inputhints').HintModification} HintModification
 */

/**
 * Opens a palette with input and hints
 * @param {(hints:HintModification)=>string[]} getList Callback to get list of hints
 * @param {()=>string} onselect Callback to call when a hint is selected
 * @param {string} placeholder Placeholder for input
 * @param {function} onremove Callback to call when palette is removed
 * @returns {void}
 */

export default function palette(getList, onselect, placeholder, onremove) {
  const $input = <input onkeydown={onkeydown} type='search' placeholder={placeholder} onfocusout={remove} enterKeyHint='go' />;
  const $mask = <div className='mask' onclick={remove} />;
  const $palette = <div id="palette">{$input}</div>;

  inputhints($input, generateHints, (value) => {
    onselect(value);
    remove();
  });

  restoreTheme(true);
  app.append($palette, $mask);
  $input.focus();

  actionStack.push({
    id: 'palette',
    action: remove,
  });

  function onkeydown(e) {
    if (e.key === 'Escape') {
      remove();
    }
  }

  /**
   * Generates hint for inputhints
   * @param {HintCallback} setHints Set hints callback
   * @param {HintModification} hintModification Hint modification object
   */
  async function generateHints(setHints, hintModification) {
    setHints([{ text: strings['loading...'], value: '' }]);
    const list = getList(hintModification);
    let data = list instanceof Promise ? await list : list;
    setHints(data);
  }

  function remove() {
    actionStack.remove('palette');
    restoreTheme();
    $palette.remove();
    $mask.remove();
    if (typeof onremove === 'function') {
      onremove();
    } else if (editorManager.activeFile.focused) {
      editorManager.editor.focus();
    }
  }
}