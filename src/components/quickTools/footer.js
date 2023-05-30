/**
 * @typedef {import('html-tag-js/ref')} Ref
 */

/**
 * Create a row with common buttons
 * @param {object} param0 Attributes
 * @param {Array<RowItem>} param0.extras Extra buttons
 * @param {Ref} param0.shift shift button refence
 * @param {Ref} param0.ctrl ctrl button refence
 * @returns {HTMLElement}
 */
export const Row1 = ({ extras, shift, ctrl, save }) => <div id='row1' className='button-container'>
  <div className='section'>
    <RowItem ref={ctrl} icon='letters' action='ctrl' letters='ctrl' />
    <RowItem icon='keyboard_tab' action='key' value={9} />
    <RowItem ref={shift} icon='letters' action='shift' letters='shft' />
    <RowItem icon='undo' action='command' value='undo' />
    <RowItem icon='redo' action='command' value='redo' />
    <RowItem icon='search' action='search' />
    <RowItem ref={save} icon='save' action='command' value='saveFile' />
    <RowItem icon='letters' action='key' value={27} letters='esc' />
  </div>
  <Extras extras={extras} />
</div>;

/**
 * Create a row with arrow keys and other buttons
 * @param {object} param0 Attributes
 * @param {Array<RowItem>} param0.extras Extra buttons
 * @returns {HTMLElement}
 */
export const Row2 = ({ extras }) => <div id='row2' className='button-container'>
  <div className='section'>
    <RowItem icon='keyboard_arrow_left' action='key' value={37} repeate={true} />
    <RowItem icon='keyboard_arrow_right' action='key' value={39} repeate={true} />
    <RowItem icon='keyboard_arrow_up' action='key' value={38} repeate={true} />
    <RowItem icon='keyboard_arrow_down' action='key' value={40} repeate={true} />
    <RowItem icon='moveline-up' action='command' value='movelinesup' />
    <RowItem icon='moveline-down' action='command' value='movelinesdown' />
    <RowItem icon='copyline-up' action='command' value='copylinesup' />
    <RowItem icon='copyline-down' action='command' value='copylinesdown' />
  </div>
  <Extras extras={extras} />
</div>;

/**
 * Create a search row with search input and buttons
 * @returns {Element}
 */
export const SearchRow1 = ({ inputRef }) => <div className='button-container' id='search_row1'>
  <input ref={inputRef} type='text' placeholder={strings.search} />
  <RowItem icon='arrow_back' action='search-prev' />
  <RowItem icon='arrow_forward' action='search-next' />
  <RowItem icon='settings' action='search-settings' />
</div>;

/**
 * Create a search row with replace input and buttons
 * @returns {Element}
 */
export const SearchRow2 = ({ inputRef, posRef, totalRef }) => <div className='button-container' id='search_row2'>
  <input ref={inputRef} type='text' placeholder={strings.replace} />
  <RowItem icon='replace' action='search-replace' />
  <RowItem icon='replace_all' action='search-replace-all' />
  <div className='search-status'>
    <span ref={posRef}>0</span>
    <span>of</span>
    <span ref={totalRef}>0</span>
  </div>
</div>;

/**@type {HTMLElement} */
export const $footer = <footer id='quick-tools' tabIndex={-1}></footer>;

/**@type {HTMLElement} */
export const $toggler = <span className='floating icon keyboard_arrow_up' id='quicktool-toggler'></span>;

/**@type {HTMLTextAreaElement} */
export const $input = <textarea
  autocapitalize="none"
  style={{
    opacity: 0,
    height: 0,
    width: 0,
    pointerEvent: 'none',
    pointerEvents: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
  }}
></textarea>;

/**
 * 
 * @param {RowItem} param0 Attributes
 * @param {string} param0.icon Icon name
 * @param {string} param0.letters Letters to show on button
 * @param {'insert'|'command'|'key'|'custom'} param0.action Action type
 * @param {string|Function} param0.value Value of button
 * @param {Ref} param0.ref Refence to button
 * @param {boolean} param0.repeate Whether to repeate the action or not
 * @returns {HTMLButtonElement}
 */
export function RowItem({ icon, letters, action, value, ref, repeate }) {
  const $item = <button
    ref={ref}
    className={`icon ${icon}`}
    data-letters={letters}
    data-action={action}
    data-repeate={repeate}
  ></button>;

  if (typeof value === 'function') {
    $item.value = value;
  } else {
    $item.dataset.value = value;
  }

  return $item;
}

/**
 * Create a list of RowItem components
 * @param {object} param0 Attributes
 * @param {Array<RowItem>} param0.extras Extra buttons
 * @returns {Array<Element>}
 */
function Extras({ extras }) {
  const div = <div className='section'></div>;
  if (Array.isArray(extras)) {
    extras.forEach((i) => {
      if (i instanceof HTMLElement) {
        div.appendChild(i);
        return;
      }

      div.append(<RowItem {...i} />);
    });
  }
  return div;
}

/**
 * @typedef {object} RowItem
 * @property {string} icon
 * @property {string} letters
 * @property {'insert'|'command'|'key'|'custom'} action
 * @property {string|Function} value
 * @property {Ref} ref
 */
