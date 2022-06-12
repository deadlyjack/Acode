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
import Box from '../../components/dialogboxes/box';
import Donate from '../donate/donate';

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
    helpers.hideAd();
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
      checkbox: values.checkFiles,
    },
    {
      key: 'console',
      text: strings.console.capitalize(),
      subText: values.console,
    },
    {
      key: 'keyboardMode',
      text: strings['keyboard mode'],
      subText: getModeString(values.keyboardMode),
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
      key: 'remember-files',
      text: strings['remember opened files'],
      checkbox: values.rememberFiles,
    },
    {
      key: 'remember-folders',
      text: strings['remember opened folders'],
      checkbox: values.rememberFolders,
    }
  ];

  // if (IS_FREE_VERSION) {
  //   settingsOptions.push({
  //     key: 'showad',
  //     text: strings['show ads'],
  //     checkbox: values.showAd,
  //   });
  // }

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
          ['NO_SUGGESTIONS', strings['no suggestions']],
          ['NO_SUGGESTIONS_AGGRESSIVE', strings['no suggestions aggressive']],
          ['NORMAL', strings.normal],
        ], {
          default: values.keyboardMode,
        })
          .then(res => {
            if (res === values.keyboardMode) return;
            system.setInputType(res);
            appSettings.value.keyboardMode = res;
            appSettings.update();
            this.changeSubText(getModeString(res));
          });
        break;

      case 'vibrateOnTap':
        this.value = !values.vibrateOnTap;
        values.vibrateOnTap = this.value;
        appSettings.update();
        break;

      case 'showad':
        this.value = !values.showAd;
        appSettings.update({
          showAd: this.value,
        });

        if (!this.value) {
          const box = Box(
            strings.info.toUpperCase(),
            `<p>${strings['disable ad message']}</p>`,
            strings.support,
            strings.cancel
          )
            .ok(() => {
              Donate();
              box.hide();
            })
            .cancle(() => {
              box.hide();
            });
        }

        if (window.ad) {
          if (!this.value && window.ad.shown) {
            helpers.hideAd(true);
          } else {
            helpers.showAd();
          }
        }

        break;

      case 'disablecache':
        this.value = !values.disableCache;
        values.disableCache = this.value;
        appSettings.update();
        break;

      case 'remember-files':
        this.value = !values.rememberFiles;
        values.rememberFiles = this.value;
        if (!this.value) {
          delete localStorage.files;
        }
        appSettings.update();
        break;

      case 'remember-folders':
        this.value = !values.rememberFolders;
        values.rememberFolders = this.value;
        if (!this.value) {
          delete localStorage.folders;
        }
        appSettings.update();
        break;

      default:
        break;
    }
  }

  $page.appendChild($settingsList);
  app.append($page);
  helpers.showAd();
}


function getModeString(mode) {
  return strings[mode.replace(/_/g, ' ').toLocaleLowerCase()]
}