/**
 * @typedef {object} KeyEvent
 * @property {'keydown' | 'keypress' | 'keyup'} type the type of the event
 * @property {boolean} bubbles whether the event bubbles up through the DOM or not
 * @property {boolean} cancelable whether the event is cancelable or not
 * @property {number} which the key code of the key pressed
 * @property {number} keyCode the key code of the key pressed
 * @property {string} key the key pressed
 * @property {boolean} ctrlKey whether the ctrl key was pressed or not
 * @property {boolean} shiftKey whether the shift key was pressed or not
 * @property {boolean} altKey whether the alt key was pressed or not
 * @property {boolean} metaKey whether the meta key was pressed or not
 */

const keys = ace.require('ace/lib/keys');
let createEvent = keyboardEvent;

/**
 * Creates a keyboard event using the KeyboardEvent constructor
 * @param {KeyEvent} event 
 * @returns 
 */
function keyboardEvent(event) {
  return new KeyboardEvent(event.type, event);
}

/**
 * Creates a keyboard event using the initKeyEvent method
 * @param {KeyEvent} e 
 * @returns 
 */
function initKeyEvent(e) {
  const event = document.createEvent('KeyboardEvent');
  const { type, bubbles, cancelable, which, key, ctrlKey, shiftKey, altKey, metaKey } = e;
  event.initKeyEvent(type, bubbles, cancelable, which, key, ctrlKey, shiftKey, altKey, metaKey);
  return event;
}

/**
 * Initializes the create function, if the event is not triggered, it will use the initKeyEvent method
 */
export function createEventInit() {
  let triggered = false;
  const $textarea = <textarea onkeydown={() => { triggered = true }} style={{ opacity: 0, pointerEvent: 'none' }}></textarea>;
  document.body.appendChild($textarea);
  const event = createEvent({
    type: 'keydown',
    bubbles: true,
    cancelable: true,
    key: 'Tab',
  });

  $textarea.dispatchEvent(event);

  setTimeout(() => {
    $textarea.remove();
    if (!triggered) {
      createEvent = initKeyEvent;
    }
  }, 0);
}

/**
 * Creates a keyboard event
 * @param {'keydown' | 'keyup'} type type of the event
 * @param {KeyEvent} event
 * @returns 
 */
export default function createKeyboardEvent(type, event) {
  if (!event.keyCode && event.key) {
    event.keyCode = keys[event.key.toLowerCase()] || event.key.charCodeAt(0);
  }
  return createEvent({ type, ...event });
}
