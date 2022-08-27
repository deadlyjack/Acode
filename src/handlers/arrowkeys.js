const keyMapping = {
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
};

export default {
  timeout: null,
  time: 300,
  /**
   * @param {TouchEvent} e 
   * @param {*} footer 
   * @returns 
   */
  onTouchStart(e, footer) {
    /**
     * @type {HTMLElement}
     */
    const el = e.target;
    const { which } = el.dataset;

    if (which === undefined) {
      return;
    }

    e.preventDefault();
    const { editor } = editorManager;
    const $textarea = editor.textInput.getElement();
    const shiftKey = footer.get('#shift-key').dataset.state === 'on';
    const dispatchEventWithTimeout = () => {
      if (this.time > 50) {
        this.time -= 10;
      }

      this.dispatchKey({ which }, shiftKey, $textarea);
      this.timeout = setTimeout(dispatchEventWithTimeout, this.time);
    };

    document.ontouchend = this.onTouchEnd.bind(this);
    document.ontouchcancel = this.onTouchEnd.bind(this);

    dispatchEventWithTimeout();
  },
  onTouchEnd() {
    this.time = 300;
    clearTimeout(this.timeout);
    document.ontouchend = null;
    document.ontouchcancel = null;
    document.ontouchstart = null;
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