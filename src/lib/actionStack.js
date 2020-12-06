import dialogs from "../components/dialogs";

function ActionStack() {
    const stack = [];

    /**
     * @param {object} fun
     * @param {string} fun.id
     * @param {Function} fun.action
     */
    function push(fun) {
        stack.push(fun);
    }

    function pop() {
        if (window.freeze) return;
        const fun = stack.pop();
        if (fun) fun.action();
        else if (appSettings.value.confirmOnExit) {
            const closeMessage = window.getCloseMessage();
            if (closeMessage) {
                dialogs.confirm(strings.warning.toUpperCase(), closeMessage)
                    .then(closeApp);
            } else {
                dialogs.confirm(strings.alert.toUpperCase(), strings['close app'])
                    .then(closeApp);
            }
        } else {
            closeApp();
        }

        function closeApp() {
            if (window.beforeClose) window.beforeClose();
            navigator.app.exitApp();
        }
    }

    function remove(id) {
        for (let i = 0; i < stack.length; ++i) {
            let action = stack[i];
            if (action.id === id) {
                stack.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    function has(id) {
        for (let act of stack)
            if (act.id === id) return true;
        return false;
    }

    return {
        push,
        pop,
        remove,
        has,
        get length() {
            return stack.length;
        }
    };
}

export default ActionStack;