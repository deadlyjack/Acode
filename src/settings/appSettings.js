import dialogs from '../components/dialogs';
import constants from '../lib/constants';
import helpers from '../utils/helpers';
import openFile from '../lib/openFile';
import fsOperation from '../fileSystem/fsOperation';
import ajax from '@deadlyjack/ajax';
import Url from '../utils/Url';
import settingsPage from '../components/settingPage';
import lang from '../lib/lang';

export default function otherSettings() {
  const values = appSettings.value;
  const title = strings['app settings'].capitalize();

  const items = [
    {
      key: 'previewPort',
      text: strings['preview port'],
      value: values.previewPort,
      prompt: strings['preview port'],
      promptType: 'number',
      promptOptions: {
        test(value) {
          const regex = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
          return regex.test(value);
        }
      }
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
      key: 'lang',
      text: strings['change language'],
      value: values.lang,
      select: lang.list,
      valueText: (value) => lang.getName(value),
    },
    {
      key: 'previewMode',
      text: strings['preview mode'],
      value: values.previewMode,
      select: [
        ['browser', strings.browser],
        ['inapp', strings.inapp],
      ],
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
      select: ['legacy', 'eruda']
    },
    {
      key: 'keyboardMode',
      text: strings['keyboard mode'],
      value: values.keyboardMode,
      valueText: getModeString,
      select: [
        ['NO_SUGGESTIONS', strings['no suggestions']],
        ['NO_SUGGESTIONS_AGGRESSIVE', strings['no suggestions aggressive']],
        ['NORMAL', strings.normal],
      ],
    },
    {
      key: 'vibrateOnTap',
      text: strings['vibrate on tap'],
      checkbox: values.vibrateOnTap,
    },
    {
      key: 'disablecache',
      text: strings['disable in-app-browser caching'],
      checkbox: values.disableCache,
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
        ['sidebar', strings.sidebar],
        ['header', strings.header],
      ],
    },
    {
      key: 'quickTools',
      text: strings['quick tools'],
      checkbox: values.quickTools,
    },
  ];

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

      case 'quickTools':
        acode.exec('toggle-quick-tools');
        break;


      case 'keyboardMode':
        system.setInputType(value);
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
