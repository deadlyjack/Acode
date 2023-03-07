import dialogs from '../components/dialogs';
import constants from '../lib/constants';
import helpers from '../utils/helpers';
import openFile from '../lib/openFile';
import fsOperation from '../fileSystem';
import ajax from '@deadlyjack/ajax';
import Url from '../utils/Url';
import settingsPage from '../components/settingPage';
import lang from '../lib/lang';
import appSettings from '../lib/settings';
import { actions } from '../handlers/quickTools';

export default function otherSettings() {
  const values = appSettings.value;
  const title = strings['app settings'].capitalize();

  const items = [
    {
      key: 'retryRemoteFsAfterFail',
      text: strings['retry ftp/sftp when fail'],
      checkbox: values.retryRemoteFsAfterFail,
    },
    {
      key: 'animation',
      text: strings.animation,
      value: values.animation,
      valueText: (value) => strings[value],
      select: [
        ['no', strings.no],
        ['yes', strings.yes],
        ['system', strings.system],
      ],
    },
    {
      key: 'fullscreen',
      text: strings.fullscreen.capitalize(),
      checkbox: values.fullscreen,
    },
    {
      key: 'lang',
      text: strings['change language'],
      value: values.lang,
      select: lang.list,
      valueText: (value) => lang.getName(value),
    },
    {
      key: 'keybindings',
      text: strings['key bindings'],
      select: [
        ['edit', strings.edit],
        ['reset', strings.reset],
      ]
    },
    {
      key: 'confirmOnExit',
      text: strings['confirm on exit'],
      checkbox: values.confirmOnExit,
    },
    {
      key: 'checkFiles',
      text: strings['check file changes'],
      checkbox: values.checkFiles,
    },
    {
      key: 'console',
      text: strings.console,
      value: values.console,
      select: [appSettings.CONSOLE_LEGACY, appSettings.CONSOLE_ERUDA],
    },
    {
      key: 'keyboardMode',
      text: strings['keyboard mode'],
      value: values.keyboardMode,
      valueText: getModeString,
      select: [
        [appSettings.KEYBOARD_MODE_NORMAL, strings.normal],
        [appSettings.KEYBOARD_MODE_NO_SUGGESTIONS, strings['no suggestions']],
        [appSettings.KEYBOARD_MODE_NO_SUGGESTIONS_AGGRESSIVE, strings['no suggestions aggressive']],
      ],
    },
    {
      key: 'vibrateOnTap',
      text: strings['vibrate on tap'],
      checkbox: values.vibrateOnTap,
    },
    {
      key: 'rememberFiles',
      text: strings['remember opened files'],
      checkbox: values.rememberFiles,
    },
    {
      key: 'rememberFolders',
      text: strings['remember opened folders'],
      checkbox: values.rememberFolders,
    },
    {
      key: 'floatingButton',
      text: strings['floating button'],
      checkbox: values.floatingButton,
    },
    {
      key: 'openFileListPos',
      text: strings['active files'],
      value: values.openFileListPos,
      valueText: (value) => strings[value],
      select: [
        [appSettings.OPEN_FILE_LIST_POS_SIDEBAR, strings.sidebar],
        [appSettings.OPEN_FILE_LIST_POS_HEADER, strings.header],
      ],
    },
    {
      key: 'quickTools',
      text: strings['quick tools'],
      checkbox: !!values.quickTools,
      info: 'Show or hide quick tools.',
    },
    {
      key: 'quickToolsTriggerMode',
      text: strings['quicktools trigger mode'],
      value: values.quickToolsTriggerMode,
      select: [
        [appSettings.QUICKTOOLS_TRIGGER_MODE_CLICK, 'click'],
        [appSettings.QUICKTOOLS_TRIGGER_MODE_TOUCH, 'touch'],
      ],
    },
    {
      key: 'touchMoveThreshold',
      text: strings['touch move threshold'],
      value: values.touchMoveThreshold,
      prompt: strings['touch move threshold'],
      promptType: 'number',
      promptOptions: {
        test(value) {
          return value >= 0;
        }
      },
    },
  ];

  items.forEach((item) => {
    Object.defineProperty(item, 'info', {
      get() {
        return strings[`info-${this.key.toLocaleLowerCase()}`];
      }
    })
  });

  function callback(key, value) {
    switch (key) {
      case 'keybindings':
        if (value === 'edit') {
          actionStack.pop();
          actionStack.pop();
          openFile(KEYBINDING_FILE, {
            render: true,
            isUnsaved: false,
          });
        } else {
          helpers.resetKeyBindings();
        }
        return;

      case 'console':
        (async () => {
          if (value === 'eruda') {
            const fs = fsOperation(Url.join(DATA_STORAGE, 'eruda.js'));
            if (!(await fs.exists())) {
              dialogs.loader.create(
                strings['downloading file'].replace('{file}', 'eruda.js'),
                strings['downloading...']
              );
              try {
                const erudaScript = await ajax({
                  url: constants.ERUDA_CDN,
                  responseType: 'text',
                  contentType: 'application/x-www-form-urlencoded',
                });
                await fsOperation(DATA_STORAGE).createFile('eruda.js', erudaScript);
                dialogs.loader.destroy();
              } catch (error) {
                helpers.error(error);
              }
            }
          }
        })();
        break;

      case 'rememberFiles':
        if (!value) {
          delete localStorage.files;
        }
        break;

      case 'rememberFolders':
        if (!value) {
          delete localStorage.folders;
        }
        break;

      case 'floatingButton':
        root.classList.toggle('hide-floating-button');
        break;

      case 'keyboardMode':
        system.setInputType(value);
        break;

      case 'fullscreen':
        if (value) acode.exec('enable-fullscreen');
        else acode.exec('disable-fullscreen');
        break;

      case 'quickTools':
        if (value) {
          value = 1;
          actions('set-quick-tools-height', 1);
        } else {
          value = 0;
          actions('set-quick-tools-height', 0);
        }
        break;

      default:
        break;
    }

    appSettings.update({
      [key]: value,
    });
  }

  function getModeString(mode) {
    return strings[mode.replace(/_/g, ' ').toLocaleLowerCase()]
  }

  settingsPage(title, items, callback);
}
