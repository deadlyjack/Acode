import Ref from 'html-tag-js/ref';

let $save;
let $ctrl;
let $shift;

export default [
  item('letters', 'ctrl', undefined, 'ctrl', false, {
    get: () => $ctrl,
    set: (el) => $ctrl = el,
  }),
  item('keyboard_tab', 'key', 9),
  item('letters', 'shift', undefined, 'shft', false, {
    get: () => $shift,
    set: (el) => $shift = el,
  }),
  item('undo', 'command', 'undo'),
  item('redo', 'command', 'redo'),
  item('search', 'search'),
  item('save', 'command', 'saveFile', undefined, false, {
    get: () => $save,
    set: (el) => $save = el,
  }),
  item('letters', 'key', 27, 'esc'),
  // extras for row 1
  item('keyboard_arrow_left', 'key', 37, undefined, true),
  item('keyboard_arrow_right', 'key', 39, undefined, true),
  item('keyboard_arrow_up', 'key', 38, undefined, true),
  item('keyboard_arrow_down', 'key', 40, undefined, true),
  item('moveline-up', 'command', 'movelinesup'),
  item('moveline-down', 'command', 'movelinesdown'),
  item('copyline-up', 'command', 'copylinesup'),
  item('copyline-down', 'command', 'copylinesdown'),
  // extras for row 2
];

/**
 * 
 * @param {'save'|'ctrl'|'shift'} id 
 * @param {Ref} ref 
 */
export function setRef(id, ref) {
  switch (id) {
    case 'save':
      $save = ref;
      break;
    case 'ctrl':
      $ctrl = ref;
      break;
    case 'shift':
      $shift = ref;
      break;
  }
}


/**
 * 
 * @param {string} icon 
 * @param {string} action 
 * @param {string|number} value 
 * @param {string} letters 
 * @param {boolean} repeate 
 * @param {Ref} ref 
 * @returns 
 */
function item(icon, action, value, letters, repeate, ref) {
  return { icon, action, value, letters, repeate, ref };
}
