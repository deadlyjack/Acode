import dialogs from '../components/dialogs';

/**
 *
 * @param {string} action
 */
function clipboardAction(action) {
  const clipboard = cordova.plugins.clipboard;
  const editor = editorManager.editor;
  const selectedText = editor.getCopyText();
  const {
    menu, //
    fullContent,
    readOnlyContent,
    color,
    start,
    end,
    update,
  } = editorManager.controls;

  if (!['select all', 'color'].includes(action)) menu.remove();

  switch (action) {
    case 'copy':
      if (selectedText) {
        clipboard.copy(selectedText);
        update();
        toast('copied to clipboard');
      }
      break;
    case 'cut':
      if (selectedText) {
        clipboard.copy(selectedText);
        const ranges = editor.selection.getAllRanges();
        ranges.map((range) => editor.remove(range));
        update();
        toast('copied to clipboard');
      }
      break;

    case 'paste':
      clipboard.paste((text) => {
        editor.execCommand('paste', text);
        update();
      });
      break;

    case 'select all':
      editor.selectAll();
      menu.innerHTML = editor.getReadOnly() ? readOnlyContent : fullContent;

      setTimeout(() => {
        const { width, height } = menu.getBoundingClientRect();
        const x = parseInt((innerWidth - width) / 2);
        const y = parseInt((innerHeight - height) / 2);
        const scale = (/scale(3d)?\(.*\)/.exec(menu.style.transform) || [])[0];
        menu.style.transform = `translate3d(${x}px, ${y}px, 0px) ${
          scale || ''
        }`;

        start.remove();
        end.remove();
      }, 0);
      break;

    case 'select':
      Acode.exec('select-word');
      break;

    case 'color':
      editor.blur();
      dialogs.color(color.style.color).then((color) => {
        editor.insert(color);
        menu.remove();
        editor.focus();
        menu.innerHTML = editor.getReadOnly() ? readOnlyContent : fullContent;
      });
      break;
  }
  if (action !== 'color') editor.focus();
}

export default clipboardAction;
