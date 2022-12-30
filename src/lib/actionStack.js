import dialogs from '../components/dialogs';
import appSettings from '../lib/settings';

function ActionStack() {
  const stack = [];
  let mark = null;
  let oncloseappCallback;

  return {
    get onCloseApp() {
      return oncloseappCallback;
    },
    set onCloseApp(cb) {
      oncloseappCallback = cb;
    },
    /**
     * @param {object} fun
     * @param {string} fun.id
     * @param {Function} fun.action
     */
    push(fun) {
      stack.push(fun);
    },
    pop() {
      if (window.freeze) return;
      const fun = stack.pop();
      if (fun) {
        fun.action();
      } else if (appSettings.value.confirmOnExit) {
        let closeMessage = acode.exitAppMessage;

        if (closeMessage) {
          dialogs
            .confirm(strings.warning.toUpperCase(), closeMessage)
            .then((confirmation) => {
              if (confirmation) closeApp();
            });
        } else {
          dialogs
            .confirm(
              strings.alert.toUpperCase(),
              strings['close app'].capitalize(0),
            )
            .then((confirmation) => {
              if (confirmation) closeApp();
            });
        }
      } else {
        closeApp();
      }

      function closeApp() {
        const { exitApp } = navigator.app;

        if (typeof oncloseappCallback === 'function') {
          const res = oncloseappCallback();
          if (res instanceof Promise) {
            res.finally(exitApp);
            return;
          }
        }

        if (IS_FREE_VERSION && window.iad?.isLoaded()) {
          window.iad.show();
        }
        exitApp();
      }
    },
    /**
     *
     * @param {String} id
     * @returns {Boolean}
     */
    remove(id) {
      for (let i = 0; i < stack.length; ++i) {
        let action = stack[i];
        if (action.id === id) {
          stack.splice(i, 1);
          return true;
        }
      }

      return false;
    },
    /**
     *
     * @param {String} id
     * @returns {Boolean}
     */
    has(id) {
      for (let act of stack) if (act.id === id) return true;
      return false;
    },
    /**
     * Sets a mark to recently pushed action
     */
    setMark() {
      mark = stack.length;
    },
    /**
     * Remove all actions that are pushed after marked positions (using `setMark()`)
     */
    clearFromMark() {
      if (mark !== null) {
        stack.splice(mark);
        mark = null;
      }
    },
    get length() {
      return stack.length;
    },
  };
}

export default ActionStack;
