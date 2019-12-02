import saveFile from "../saveFile";

/**
 * 
 * @param {TouchEvent | MouseEvent} e 
 * @param {HTMLElement} footer
 * @param {string} row1
 * @param {string} row2
 */
function quickToolAction(e, footer, row1, row2) {
    if (!e.target) return;

    const el = e.target;
    const action = el.getAttribute('action');

    if (!action) return;

    const editor = editorManager.editor;
    const $row2 = footer.querySelector('#row2');
    const $textarea = editor.textInput.getElement();
    const shiftKey = footer.querySelector('#shift-key').getAttribute('data-state') === 'on' ? true : false;
    let state;

    if (action !== 'pallete') editor.focus();

    switch (action) {
        case 'pallete':
            editor.execCommand('openCommandPallete');
            break;

        case 'tab':
            $textarea.dispatchEvent(new KeyboardEvent('keydown', {
                key: 9,
                keyCode: 9,
                shiftKey
            }));
            break;

        case 'shift':
            state = el.getAttribute('data-state') || 'off';
            if (state === 'off') {
                $textarea.dispatchEvent(new KeyboardEvent('keydown'));
                el.setAttribute('data-state', 'on');
                el.classList.add('active');
            } else {
                $textarea.dispatchEvent(new KeyboardEvent('keyup'));
                el.setAttribute('data-state', 'off');
                el.classList.remove('active');
            }
            break;

        case 'undo':
            editor.undo();
            break;

        case 'redo':
            editor.redo();
            break;

        case 'search':

            break;

        case 'save':
            saveFile(editorManager.activeFile);
            break;

        case 'more':
            if (!$row2) {
                footer.innerHTML += row2;
                app.classList.add('twostories');
            } else {
                footer.removeChild($row2);
                app.classList.remove('twostories');
            }
            break;

        case 'moveline-up':
            editor.moveLinesUp();
            break;

        case 'moveline-down':
            editor.moveLinesDown();
            break;

        case 'copyline-up':
            editor.copyLinesUp();
            break;

        case 'copyline-down':
            editor.copyLinesDown();
            break;
    }
}

export default quickToolAction;