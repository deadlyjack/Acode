export default function configEditor(editor) {
  editor.commands.addCommands([
    {
      name: 'increaseFontSize',
      bindKey: 'Ctrl-+',
      exec: function (editor) {
        var size = parseInt(editor.getFontSize(), 10) || 12;
        editor.setFontSize(size + 1);
      },
    },
    {
      name: 'decreaseFontSize',
      bindKey: 'Ctrl+-',
      exec: function (editor) {
        var size = parseInt(editor.getFontSize(), 10) || 12;
        editor.setFontSize(Math.max(size - 1 || 1));
      },
    },
    {
      name: 'resetFontSize',
      bindKey: 'Ctrl+0|Ctrl-Numpad0',
      exec: function (editor) {
        editor.setFontSize(12);
      },
    },
  ]);
}
