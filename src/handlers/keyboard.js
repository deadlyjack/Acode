import KeyboardEvent from 'utils/keyboardEvent';

export const keydownState = {
  escape: false,
};

/**
 * Handles keyboard events
 * @param {KeyboardEvent} e 
 */
export default function keyboardHandler(e) {
  const $activeElement = document.activeElement;
  const { key, ctrlKey, shiftKey, altKey, metaKey } = e;

  if ($activeElement instanceof HTMLTextAreaElement) return;
  if (!ctrlKey && !shiftKey && !altKey && !metaKey) return;
  if (["Control", "Alt", "Meta", "Shift"].includes(key)) return;

  const event = KeyboardEvent('keydown', { key, ctrlKey, shiftKey, altKey, metaKey });
  const editor = editorManager.editor.textInput.getElement();
  editor.dispatchEvent(event);
}
