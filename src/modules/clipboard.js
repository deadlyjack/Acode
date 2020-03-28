import dialogs from "../components/dialogs";

/**
 * 
 * @param {string} action 
 */
function clipboardAction(action) {
    const clipboard = cordova.plugins.clipboard;
    const editor = editorManager.editor;
    const {
        menu,
        fullContent,
        readOnlyContent,
        color,
        start,
        end,
        update
    } = editorManager.controls;
    const selectedText = editor.getCopyText();

    if (!['select all', 'color'].includes(action)) menu.remove();

    switch (action) {
        case 'copy':
            if (selectedText) {
                clipboard.copy(selectedText);
                update();
                plugins.toast.showShortBottom('copied to clipboard');
            }
            break;
        case 'cut':
            if (selectedText) {
                clipboard.copy(selectedText);
                const ranges = editor.selection.getAllRanges();
                ranges.map(range => {
                    editor.remove(range);
                    return range;
                });
                update();
                plugins.toast.showShortBottom('copied to clipboard');
            }
            break;

        case 'paste':
            clipboard.paste(text => {
                editor.execCommand('paste', text);
                update();
            });
            break;

        case 'select all':
            editor.selectAll();
            menu.innerHTML = editor.getReadOnly() ? readOnlyContent : fullContent;
            const t = /translate3d\((.+)\)/.exec(menu.style.transform);
            if (t && t[1]) {
                const values = t[1].split(',');
                menu.style.transform = `translate3d(40px, ${values[1]}, ${values[2]})`;
            }
            setTimeout(() => {
                start.remove();
                end.remove();
            }, 0);
            break;

        case 'select':
            Acode.exec("select-word");
            break;

        case 'color':
            dialogs.color(color.style.color)
                .then(color => {
                    editor.insert(color);
                    menu.remove();
                    editor.focus();
                    menu.innerHTML = editor.getReadOnly() ? readOnlyContent : fullContent;
                });
            break;
    }
    editor.focus();
}

export default clipboardAction;