export default {
  interval: null,
  onTouchStart: function (e, footer) {
    /**
     * @type {HTMLElement}
     */
    const el = e.target;
    const action = el.getAttribute('action');

    if (!action || ['left', 'right', 'up', 'down'].indexOf(action) < 0) return;

    const editor = editorManager.editor;
    const $textarea = editor.textInput.getElement();
    const shiftKey =
      footer.querySelector('#shift-key').getAttribute('data-state') === 'on'
        ? true
        : false;
    const controls = editorManager.controls;

    document.ontouchend = document.ontouchcancel = (e) => {
      this.onTouchEnd();
      document.ontouchend =
        document.ontouchcancel =
        document.ontouchstart =
          null;
    };

    if (!shiftKey && controls.callBeforeContextMenu)
      controls.callBeforeContextMenu();

    switch (action) {
      case 'left':
        this.dispatchKey(37, shiftKey, $textarea);
        break;

      case 'right':
        this.dispatchKey(39, shiftKey, $textarea);
        break;

      case 'up':
        this.dispatchKey(38, shiftKey, $textarea);
        break;

      case 'down':
        this.dispatchKey(40, shiftKey, $textarea);
        break;
    }

    e.preventDefault();
  },
  onTouchEnd: function () {
    if (this.interval) clearInterval(this.interval);
  },
  dispatchKey: function (key, shiftKey, $textarea) {
    dispatchEvent();
    this.interval = setInterval(dispatchEvent, 100);

    function dispatchEvent() {
      const keyevent = window.createKeyboardEvent('keydown', {
        key,
        keyCode: key,
        shiftKey,
      });

      $textarea.dispatchEvent(keyevent);
    }
  },
};
