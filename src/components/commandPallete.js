import helpers from '../utils/helpers';
import pallete from './pallete';

export default async function commandPallete() {
  const recentlyUsedCommands = RecentlyUsedCommands();
  const commands = Object.values(editorManager.editor.commands.commands);

  pallete(generateHints, onselect, strings['type command']);

  function generateHints() {
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

    return hints;
  }

  function onselect(value) {
    const command = commands.find(({ name }) => name === value);
    if (!command) return;
    recentlyUsedCommands.push(value);
    command.exec(editorManager.editor);
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
