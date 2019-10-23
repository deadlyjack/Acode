/**
 * 
 * @param {*} action 
 * @param {acodeEditor} acodeEditor 
 */
function clipboardAction(action, acodeEditor) {
    const clipboard = cordova.plugins.clipboard;
    const editor = acodeEditor.editor;
    const selectedText = editor.getCopyText();
    switch (action) {
        case 'copy':
            if (selectedText) {
                clipboard.copy(selectedText);
                acodeEditor.updateControls();
                plugins.toast.showShortBottom('copied to clipboard');
            }
            break;
        case 'cut':
            if (selectedText) {
                clipboard.copy(selectedText);
                const ranges = editor.selection.getAllRanges();
                ranges.map(range => {
                    editor.remove(range);
                });
                acodeEditor.updateControls();
                plugins.toast.showShortBottom('copied to clipboard');
            }
            break;

        case 'paste':
            clipboard.paste(text => {
                editor.execCommand('paste', text);
                acodeEditor.updateControls();
            });
            break;

        case 'select all':
            editor.selectAll();
            setTimeout(() => {
                acodeEditor.controls.start.remove();
                acodeEditor.controls.end.remove();
            }, 0);
            break;

        case 'openCommandPallete':
            editor.execCommand(action);
            break;
    }
    editor.focus();
}

export default clipboardAction;