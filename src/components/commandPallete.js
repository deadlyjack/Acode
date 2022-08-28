import tag from 'html-tag-js';
import helpers from '../utils/helpers';
import inputhints from './inputhints';

export default async function commandPallete() {
  const recentlyUsedCommands = RecentlyUsedCommands();
  const commands = Object.values(editorManager.editor.commands.commands);
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

  const { container } = inputhints($input, generateHints, onselect);

  // container.id = 'command-pallete-hint-box';
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

  function generateHints(setHints) {
    recentlyUsedCommands.commands.forEach((name) => {
      const command = Object.assign({}, commands.find(command => command.name === name));
      if (command) {
        command.recentlyUsed = true;
        commands.unshift(command);
      }
    });
    const hints = commands.map(({ name, description, bindKey, recentlyUsed }) => ({
      value: name,
      text: `<span ${recentlyUsed ? `data-str='${strings['recently used']}'` : ''}>${description ?? name}</span><small>${bindKey?.win ?? ''}</small>`,
    }));

    setHints(hints);
  }

  function onselect(value) {
    const command = commands.find(({ name }) => name === value);
    if (!command) return;
    recentlyUsedCommands.push(value);
    command.exec(editorManager.editor);
    remove();
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
