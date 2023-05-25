import fsOperation from "fileSystem";
import actions from 'handlers/quickTools';
import keyBindings from "lib/keyBindings";
import helpers from "utils/helpers";

const commands = [
  {
    name: 'findFile',
    description: 'Find file in workspace',
    exec() {
      acode.exec('find-file');
    },
  },
  {
    name: 'closeCurrentTab',
    description: 'Close current tab',
    exec() {
      acode.exec('close-current-tab');
    },
  },
  {
    name: 'closeAllTabs',
    description: 'Close all tabs',
    exec() {
      acode.exec('close-all-tabs');
    },
  },
  {
    name: 'newFile',
    description: 'Create new file',
    exec() {
      acode.exec('new-file');
    },
    readOnly: true,
  },
  {
    name: 'openFile',
    description: 'Open a file',
    exec() {
      acode.exec('open-file');
    },
    readOnly: true,
  },
  {
    name: 'openFolder',
    description: 'Open a folder',
    exec() {
      acode.exec('open-folder');
    },
    readOnly: true,
  },
  {
    name: 'saveFile',
    description: 'Save current file',
    exec() {
      acode.exec('save');
    },
    readOnly: true,
  },
  {
    name: 'saveFileAs',
    description: 'Save as current file',
    exec() {
      acode.exec('save-as');
    },
    readOnly: true,
  },
  {
    name: 'nextFile',
    description: 'Open next file tab',
    exec() {
      acode.exec('next-file');
    },
  },
  {
    name: 'prevFile',
    description: 'Open previous file tab',
    exec() {
      acode.exec('prev-file');
    },
  },
  {
    name: 'showSettingsMenu',
    description: 'Show settings menu',
    exec() {
      acode.exec('open', 'settings');
    },
    readOnly: true,
  },
  {
    name: 'renameFile',
    description: 'Rename active file',
    exec() {
      acode.exec('rename');
    },
    readOnly: true,
  },
  {
    name: 'run',
    description: 'Preview HTML and MarkDown',
    exec() {
      acode.exec('run');
    },
    readOnly: true,
  },
  {
    name: 'toggleFullscreen',
    description: 'Toggle full screen mode',
    exec() {
      acode.exec('toggle-fullscreen');
    },
  },
  {
    name: 'toggleSidebar',
    description: 'Toggle sidebar',
    exec() {
      acode.exec('toggle-sidebar');
    },
  },
  {
    name: 'toggleMenu',
    description: 'Toggle main menu',
    exec() {
      acode.exec('toggle-menu');
    },
  },
  {
    name: 'toggleEditMenu',
    description: 'Toggle edit menu',
    exec() {
      acode.exec('toggle-editmenu');
    },
  },
  {
    name: 'selectall',
    description: 'Select all',
    exec(editor) {
      editor.selectAll();
    },
    readOnly: true,
  },
  {
    name: 'gotoline',
    description: 'Go to line...',
    exec() {
      acode.exec('goto');
    },
    readOnly: true,
  },
  {
    name: 'find',
    description: 'Find',
    exec() {
      acode.exec('find');
    },
    readOnly: true,
  },
  {
    name: 'copy',
    description: 'Copy',
    exec(editor) {
      const { clipboard } = cordova.plugins;
      const copyText = editor.getCopyText();
      clipboard.copy(copyText);
      toast(strings['copied to clipboard']);
    },
    readOnly: true,
  },
  {
    name: 'cut',
    description: 'Cut',
    exec(editor) {
      let cutLine =
        editor.$copyWithEmptySelection && editor.selection.isEmpty();
      let range = cutLine
        ? editor.selection.getLineRange()
        : editor.selection.getRange();
      editor._emit('cut', range);
      if (!range.isEmpty()) {
        const { clipboard } = cordova.plugins;
        const copyText = editor.session.getTextRange(range);
        clipboard.copy(copyText);
        toast(strings['copied to clipboard']);
        editor.session.remove(range);
      }
      editor.clearSelection();
    },
    scrollIntoView: 'cursor',
    multiSelectAction: 'forEach',
  },
  {
    name: 'paste',
    description: 'Paste',
    exec() {
      const { clipboard } = cordova.plugins;
      clipboard.paste((text) => {
        editorManager.editor.$handlePaste(text);
      });
    },
    scrollIntoView: 'cursor',
  },
  {
    name: 'replace',
    description: 'Replace',
    exec() {
      acode.exec('replace');
    },
  },
  {
    name: 'openCommandPallete',
    description: 'Open command pallete',
    exec() {
      acode.exec('command-pallete');
    },
    readOnly: true,
  },
  {
    name: 'modeSelect',
    description: 'Change language mode...',
    exec() {
      acode.exec('syntax');
    },
    readOnly: true,
  },
  {
    name: 'settings:toggleQuickTools',
    description: 'Toggle quick tools',
    exec() {
      actions('toggle-quick-tools');
    },
  }
];

export function setCommands(editor) {
  commands.forEach((command) => {
    editor.commands.addCommand(command);
  });
}

/**
 * Sets key bindings for the editor
 * @param {AceAjax.Editor} editor 
 */
export async function setKeyBindings({ commands }) {
  let keyboardShortcuts = keyBindings;
  try {
    const bindingsFile = fsOperation(KEYBINDING_FILE);
    if (await bindingsFile.exists()) {
      const bindings = await bindingsFile.readFile('json');
      keyboardShortcuts = compareAndFixKeyBindings(keyboardShortcuts, bindings);
    } else {
      helpers.resetKeyBindings();
    }
  } catch (error) {
    console.error(error);
    helpers.resetKeyBindings();
  }

  Object.keys(commands.byName).forEach((name) => {
    const shortcut = keyboardShortcuts[name];

    if (!shortcut || !shortcut.key) return;

    const command = { ...commands.byName[name] };

    if (shortcut.description) {
      command.description = shortcut.description;
    }

    if (shortcut.key) {
      command.bindKey = { win: shortcut.key };
    }

    commands.removeCommand(name);
    commands.addCommand(command);
  });
}

/**
 * @typedef {Object} KeyBinding
 * @property {string} key
 * @property {string} description
 * @property {string} action
 * @property {boolean} [readOnly]
 */

/**
 *  @typedef {Map<string, KeyBinding>} KeyBindings
 */

/** 
 * @param {KeyBindings} def Default key bindings
 * @param {KeyBindings} saved Saved key bindings
 * @returns {KeyBindings} Fixed key bindings
 */
function compareAndFixKeyBindings(def, saved) {
  const fixed = {};
  Object.keys(def).map((name) => {
    const key = def[name].key;
    const savedKey = saved[name]?.key;
    if (savedKey && savedKey !== key) {
      fixed[name] = {
        ...def[name],
        key: savedKey,
      };
    } else {
      fixed[name] = def[name];
    }
  });
  return fixed;
}
