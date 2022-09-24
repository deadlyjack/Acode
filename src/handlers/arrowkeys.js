import constants from "../lib/constants";

const keyMapping = {
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
};

export default {
  timeout: null,
  time: 300,
  // click simulation doesn't work on some devices
  onClick(e, footer) {
    const $el = e.target;
    const { which } = $el.dataset;

    if (which === undefined) {
      return;
    }

    if ($el.classList.contains('active')) {
      $el.classList.remove('active');
      clearTimeout(this.timeout);
      this.time = 300;
      return;
    }

    const { editor } = editorManager;
    const $textarea = editor.textInput.getElement();
    const shiftKey = footer.get('#shift-key').dataset.state === 'on';

    this.dispatchKey({ which }, shiftKey, $textarea);
  },
  oncontextmenu(e, footer) {
    if (appSettings.value.vibrateOnTap) {
      navigator.vibrate(constants.VIBRATION_TIME_LONG);
    }
    const $el = e.target;
    const { which } = $el.dataset;
    const { editor, activeFile } = editorManager;
    const $textarea = editor.textInput.getElement();
    const shiftKey = footer.get('#shift-key').dataset.state === 'on';

    const dispatchEventWithTimeout = () => {
      if (this.time > 50) {
        this.time -= 10;
      }

      this.dispatchKey({ which }, shiftKey, $textarea);
      this.timeout = setTimeout(dispatchEventWithTimeout, this.time);
    };

    if (activeFile.focused) {
      editor.focus();
    }
    dispatchEventWithTimeout();
    $el.classList.add('active');
  },
  dispatchKey({ which }, shiftKey, $textarea) {
    const keyevent = window.createKeyboardEvent('keydown', {
      key: keyMapping[which],
      keyCode: which,
      shiftKey,
    });

    $textarea.dispatchEvent(keyevent);
  },
};