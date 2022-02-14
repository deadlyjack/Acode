import tag from 'html-tag-js';
import Page from '../../components/page';
import dialogs from '../../components/dialogs';
import gen from '../../components/gen';
import constants from '../../lib/constants';
import helpers from '../../lib/utils/helpers';
import openFile from '../../lib/openFile';
import internalFs from '../../lib/fileSystem/internalFs';
import fsOperation from '../../lib/fileSystem/fsOperation';
import ajax from '@deadlyjack/ajax';
import Url from '../../lib/utils/Url';

export default function otherSettings() {
  const values = appSettings.value;
  const $page = Page(strings['app settings'].capitalize());
  const $settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'other-settings',
    action: $page.hide,
  });
  $page.onhide = function () {
    actionStack.remove('other-settings');
  };

  const settingsOptions = [
    {
      key: 'animation',
      text: strings.animation.capitalize(),
      checkbox: values.animation,
    },
    {
      key: 'language',
      text: strings['change language'],
      subText: strings.lang,
    },
    {
      key: 'previewMode',
      text: strings['preview mode'],
      subText: values.previewMode,
    },
    {
      key: 'keybindings',
      text: strings['key bindings'],
    },
    {
      key: 'confirm-on-exit',
      text: strings['confirm on exit'],
      checkbox: values.confirmOnExit,
    },
    {
      key: 'check-files',
      text: strings['check file changes'],
      checkbox: values.showConsole,
    },
    {
      key: 'console',
      text: strings.console.capitalize(),
      subText: values.console,
    },
    {
      key: 'keyboardMode',
      text: strings['keyboard mode'],
      subText: strings[values.keyboardMode.toLocaleLowerCase()],
    },
    {
      key: 'vibrateOnTap',
      text: strings['vibrate on tap'],
      checkbox: values.vibrateOnTap,
    },
  ];

  gen.listItems($settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    const lanuguages = [];
    const langList = constants.langList;
    for (let lang in langList) {
      lanuguages.push([lang, langList[lang]]);
    }
    switch (this.key) {
      case 'animation':
        appSettings.update({
          animation: !values.animation,
        });
        app.classList.toggle('no-animation');
        this.value = values.animation;
        break;

      case 'language':
        dialogs
          .select(this.text, lanuguages, {
            default: values.lang,
          })
          .then((res) => {
            if (res === values.lang) return;
            appSettings.value.lang = res;
            appSettings.update();
            internalFs
              .readFile(`${ASSETS_DIRECTORY}/lang/${res}.json`)
              .then((res) => {
                const text = helpers.decodeText(res.data);
                window.strings = JSON.parse(text);
                if (actionStack.has('settings-main')) actionStack.pop();
              });
          });
        break;

      case 'keybindings':
        dialogs
          .select(strings['key bindings'], [
            ['edit', strings.edit],
            ['reset', strings.reset],
          ])
          .then((res) => {
            if (res === 'edit') {
              actionStack.pop();
              actionStack.pop();
              openFile(KEYBINDING_FILE, {
                render: true,
                isUnsaved: false,
              });
            } else {
              helpers.resetKeyBindings();
            }
          });
        break;

      case 'previewMode':
        dialogs
          .select(this.text, ['browser', 'inapp'], {
            default: values.previewMode,
          })
          .then((res) => {
            if (res === values.previewMode) return;
            appSettings.value.previewMode = res;
            appSettings.update();
            this.changeSubText(res);
          });
        break;

      case 'confirm-on-exit':
        this.value = values.confirmOnExit = !values.confirmOnExit;
        appSettings.update();
        break;

      case 'check-files':
        this.value = values.checkFiles = !values.checkFiles;
        appSettings.update();
        break;

      case 'console':
        dialogs.select(strings['console'], ['legacy', 'eruda'], {
          default: values.console,
        })
          .then(res => {
            if (res === values.console) return;
            (async () => {
              if (res === 'eruda') {
                const fs = fsOperation(Url.join(DATA_STORAGE, 'eruda.js'));
                if (!(await fs.exists())) {
                  dialogs.loader.create(
                    strings['downloading file'].replace('{file}', 'eruda.js'),
                    strings['downloading...']
                  );
                  const erudaScript = await ajax({ url: constants.ERUDA_CDN, responseType: 'text' });
                  await fsOperation(DATA_STORAGE).createFile('eruda.js', erudaScript);
                  dialogs.loader.destroy();
                }
              }
              appSettings.value.console = res;
              appSettings.update();
              this.changeSubText(res);
            })();
          });
        break;

      case 'keyboardMode':
        dialogs.select(strings['keyboard mode'], [
          ['CODE', strings.code],
          ['NORMAL', strings.normal],
        ], {
          default: values.keyboardMode,
        })
          .then(res => {
            if (res === values.keyboardMode) return;
            system.setInputType(res);
            appSettings.value.keyboardMode = res;
            appSettings.update();
            this.changeSubText(strings[res.toLocaleLowerCase()]);
          });

      default:
        settings[this.key] = !values[this.key];
        appSettings.update(settings);
        this.value = values[this.key];
        break;
    }
  }

  $page.appendChild($settingsList);
  document.body.append($page);
}
