import tag from 'html-tag-js';
import Commands from '../lib/ace/commands';
import inputhints from './inputHints';

export function commandPallete() {
  const commands = Commands();
  const $input = tag('input', {
    type: 'search',
    placeholder: 'Type command',
    onfocusout: remove,
  });
  const $mask = tag('span', {
    className: 'mask',
    onclick() {
      remove();
    },
  })
  const $pallete = tag('div', {
    id: 'command-pallete',
    children: [$input],
  });

  inputhints($input, ((setHints) => {
    setHints(
      commands.map(({ name, description, bindKey }) => ({
        value: name,
        text: `${description ?? name} <small>${bindKey?.win ?? ''}</small>`,
      })),
    );
  }), (value) => {
    const command = commands.find(({ name }) => name === value);
    if (!command) return;
    command.exec(editorManager.editor);
    remove();
  });

  actionStack.push({
    id: 'command-pallete',
    action: remove,
  });

  window.restoreTheme(true);
  app.append($pallete, $mask);
  $input.focus();

  function remove() {
    window.restoreTheme();
    $mask.remove();
    $pallete.remove();
  }
}