import Ref from 'html-tag-js/ref';

/**
 * @typedef {'save'|'ctrl'|'shift'|'alt'|'meta'} RefId
 */

let $save;
let $ctrl;
let $shift;
let $alt;
let $meta;

export default [
  item('ctrl-key', 'letters', 'ctrl', undefined, 'ctrl', false),
  item('tab-key', 'keyboard_tab', 'key', 9),
  item('shift-key', 'letters', 'shift', undefined, 'shft', false),
  item('undo', 'undo', 'command', 'undo'),
  item('redo', 'redo', 'command', 'redo'),
  item('search', 'search', 'search'),
  item('save', 'save', 'command', 'saveFile', undefined, false),
  item('esc-key', 'letters', 'key', 27, 'esc'),
  item('curlybracket', 'letters', 'insert', '{', '{'),
  item('curlybracket', 'letters', 'insert', '}', '}'),
  item('squarebracket', 'letters', 'insert', '[', '['),
  item('squarebracket', 'letters', 'insert', ']', ']'),
  item('parentheses', 'letters', 'insert', '(', '('),
  item('parentheses', 'letters', 'insert', ')', ')'),
  item('anglebracket', 'letters', 'insert', '<', '<'),
  item('anglebracket', 'letters', 'insert', '>', '>'),
  item('left-arrow-key', 'keyboard_arrow_left', 'key', 37, undefined, true),
  item('right-arrow-key', 'keyboard_arrow_right', 'key', 39, undefined, true),
  item('up-arrow-key', 'keyboard_arrow_up', 'key', 38, undefined, true),
  item('down-arrow-key', 'keyboard_arrow_down', 'key', 40, undefined, true),
  item('moveline-up', 'moveline-up', 'command', 'movelinesup'),
  item('moveline-down', 'moveline-down', 'command', 'movelinesdown'),
  item('copyline-up', 'copyline-up', 'command', 'copylinesup'),
  item('copyline-down', 'copyline-down', 'command', 'copylinesdown'),
  item('semicolon', 'letters', 'insert', ';', ';'),
  item('quotation', 'letters', 'insert', "'", "'"),
  item('quotation', 'letters', 'insert', '"', '"'),
  item('and', 'letters', 'insert', '&', '&'),
  item('bar', 'letters', 'insert', '|', '|'),
  item('equal', 'letters', 'insert', '=', '='),
  item('slash', 'letters', 'insert', '/', '/'),
  item('exclamation', 'letters', 'insert', '!', '!'),
  item('command-pallete', 'keyboard_control', 'command', 'openCommandPallete'),
  item('alt-key', 'letters', 'alt', undefined, 'alt', false),
  item('meta-key', 'letters', 'meta', undefined, 'meta', false)
];

/**
 * Sets reference
 * @param {RefId} id
 * @param {Ref} reference
 */
export function setRef(id, reference) {
  ref(id, reference);
}

/**
 * Gets reference 
 * @param {RefId} id 
 * @returns {Ref}
 */
export function getRef(id) {
  return ref(id);
}

/**
 * Set or get ref
 * @param {RefId} id 
 * @param {Ref} [reference] 
 */
function ref(id, reference) {
  switch (id) {
    case 'save':
      if (reference) {
        $save = reference;
        return;
      }
      return $save;
    case 'ctrl':
      if (reference) {
        $ctrl = reference;
        return;
      }
      return $ctrl;
    case 'shift':
      if (reference) {
        $shift = reference;
        return;
      }
      return $shift;
    case 'alt':
      if (reference) {
        $alt = reference;
        return;
      }
      return $alt;
    case 'meta':
      if (reference) {
        $meta = reference;
        return;
      }
      return $meta;
  }
}

/**
 * Get description of a button
 * @param {string} id button id 
 * @returns 
 */
export function description(id) {
  return strings[`quicktools:${id}`];
}


/**
 * 
 * @param {string} icon 
 * @param {string} action 
 * @param {string|number} value 
 * @param {string} letters 
 * @param {boolean} repeate 
 * @returns 
 */
function item(id, icon, action, value, letters, repeate) {
  return {
    id,
    icon,
    action,
    value,
    letters,
    repeate,
    get ref() {
      return ref(action);
    },
  };
}
