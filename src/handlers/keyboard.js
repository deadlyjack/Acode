import { HARDKEYBOARDHIDDEN_NO, getSystemConfiguration } from 'lib/systemConfiguration';
import KeyboardEvent from 'utils/keyboardEvent';
import windowResize from './windowResize';

/**
 * Keyboard event list
 * @typedef {'key'|'keyBoardShow'|'keyboardHide'} KeyboardEventName
 */

const event = {
  key: [],
  keyBoardShow: [],
  keyboardHide: [],
};

let escKey = false;
let escResetTimeout = null;
let windowHeight = window.innerHeight;
let softKeyboardHeight = 0;

export const keydownState = {
  /**
   * Get esc key state
   * @returns {boolean}
   */
  get esc() {
    return escKey;
  },
  /**
   * Set esc key state
   * @param {boolean} val
   */
  set esc(val) {
    escKey = val;
    if (!val) return;
    clearTimeout(escResetTimeout);
    escResetTimeout = setTimeout(() => {
      escKey = false;
    }, 500);
  }
};

/**
 * Handles keyboard events
 * @param {KeyboardEvent} e 
 */
export default function keyboardHandler(e) {
  const $target = e.target;
  const { key, ctrlKey, shiftKey, altKey, metaKey } = e;

  if ($target instanceof HTMLTextAreaElement) {
    keydownState.esc = key === 'Escape';
    return;
  }

  if (!ctrlKey && !shiftKey && !altKey && !metaKey) return;
  if (["Control", "Alt", "Meta", "Shift"].includes(key)) return;

  const event = KeyboardEvent('keydown', { key, ctrlKey, shiftKey, altKey, metaKey });
  const editor = editorManager.editor.textInput.getElement();
  editor.dispatchEvent(event);
}

windowResize.on('resizeStart', async () => {
  const { keyboardHeight } = await getSystemConfiguration();
  if (windowHeight > window.innerHeight) {
    softKeyboardHeight = keyboardHeight;
  }
});

windowResize.on('resize', async () => {
  const { hardKeyboardHidden } = await getSystemConfiguration();
  const externalKeyboard = hardKeyboardHidden === HARDKEYBOARDHIDDEN_NO;

  if (externalKeyboard && softKeyboardHeight < 100) return;

  const keyboardHiddenYes = windowHeight <= window.innerHeight;

  if (keyboardHiddenYes) {
    emit('keyboardHide');
  } else {
    emit('keyBoardShow');
  }

  focusBlurEditor(keyboardHiddenYes);
  showHideAd(keyboardHiddenYes);
});

/**
 * Add event listener for keyboard event.
 * @param {KeyboardEventName} eventName 
 * @param {Function} callback 
 * @returns 
 */
keyboardHandler.on = (eventName, callback) => {
  if (!event[eventName]) return;
  event[eventName].push(callback);
};

/**
 * Remove event listener for keyboard event.
 * @param {KeyboardEventName} eventName 
 * @param {Function} callback 
 * @returns 
 */
keyboardHandler.off = (eventName, callback) => {
  if (!event[eventName]) return;
  event[eventName] = event[eventName].filter(cb => cb !== callback);
};

/**
  * Emit keyboard event.
 * @param {KeyboardEventName} eventName 
 * @returns 
 */
function emit(eventName) {
  if (!event[eventName]) return;
  event[eventName].forEach(cb => cb());
}

/**
 * Focus the editor if keyboard is visible, blur it otherwise.
 * @param {boolean} keyboardHidden 
 * @returns 
 */
function focusBlurEditor(keyboardHidden) {
  if (keyboardHidden) {
    document.activeElement?.blur();
  }
}

/**
 * Show ad if keyboard is hidden and ad is active, hide ad otherwise.
 * @param {boolean} keyboardHidden 
 */
function showHideAd(keyboardHidden) {
  const bannerIsActive = !!window.ad?.active;

  if (!keyboardHidden && bannerIsActive) {
    window.ad?.hide();
  } else if (bannerIsActive) {
    window.ad?.show();
  }
}
