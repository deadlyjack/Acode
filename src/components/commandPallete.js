import tag from 'html-tag-js';
import Commands from '../lib/ace/commands';
import helpers from '../lib/utils/helpers';
import inputhints from './inputHints';

export async function commandPallete() {
  const recentlyUsedCommands = RecentlyUsedCommands();
  const commands = await Commands();
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
    recentlyUsedCommands.commands.forEach((name) => {
      const command = Object.assign({}, commands.find(command => command.name === name));
      if (command) {
        command.recentlyUsed = true;
        commands.unshift(command);
      }
    });
    setHints(
      commands.map(({ name, description, bindKey, recentlyUsed }) => ({
        value: name,
        text: `<span ${recentlyUsed ? `data-str='${strings['recently used']}'` : ''}>${description ?? name}</span><small>${bindKey?.win ?? ''}</small>`,
      })),
    );
  }), (value) => {
    const command = commands.find(({ name }) => name === value);
    if (!command) return;
    recentlyUsedCommands.push(value);
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

function RecentlyUsedCommands() {
  return {
    get commands() {
      return helpers.parseJSON(localStorage.getItem('recentlyUsedCommands')) || [];
    },
    push(command) {
      const commands = this.commands;
      if (commands.length > 10) {
        commands.pop();
      }
      if (commands.includes(command)) {
        commands.splice(commands.indexOf(command), 1);
      }
      commands.unshift(command);
      localStorage.setItem('recentlyUsedCommands', JSON.stringify(commands));
    }
  }
}