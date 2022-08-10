import Page from '../../components/page';
import gen from '../../components/gen';
import dialogs from '../../components/dialogs';
import constants from '../../lib/constants';
import tag from 'html-tag-js';
import helpers from '../../lib/utils/helpers';
import scrollSettings from './scrolling';

export default function editorSettings() {
  const $page = Page(strings['editor settings'].capitalize());
  const $settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'settings-editor',
    action: $page.hide,
  });
  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('settings-editor');
  };

  let values = appSettings.value;

  appSettings.on('update', function (newValues) {
    values = newValues;
  });

  const settingsOptions = [
    {
      key: 'autosave',
      text: strings.autosave.capitalize(),
      subText: values.autosave ? values.autosave + '' : strings.no,
    },
    {
      key: 'fontSize',
      text: strings['font size'],
      subText: values.fontSize,
    },
    {
      key: 'textWrap',
      text: strings['text wrap'],
      checkbox: values.textWrap,
    },
    {
      key: 'softTab',
      text: strings['soft tab'],
      checkbox: values.softTab,
    },
    {
      key: 'tabSize',
      text: strings['tab size'],
      subText: values.tabSize,
    },
    {
      key: 'linenumbers',
      text: strings['show line numbers'],
      checkbox: values.linenumbers,
    },
    {
      key: 'lineHeight',
      text: strings['line height'],
      subText: values.lineHeight,
    },
    {
      key: 'formatOnSave',
      text: strings['format on save'],
      subText: values.formatOnSave ? strings.yes : strings.no,
    },
    {
      key: 'linting',
      text: strings.linting,
      checkbox: values.linting,
    },
    {
      key: 'showSpaces',
      text: strings['show spaces'],
      checkbox: values.showSpaces,
    },
    {
      key: 'openFileListPos',
      text: strings['active files'],
      subText: values.openFileListPos,
    },
    {
      key: 'editorFont',
      text: strings['editor font'],
      subText: values.editorFont,
    },
    {
      key: 'quickTools',
      text: strings['quick tools'],
      checkbox: values.quickTools,
    },
    {
      key: 'fullscreen',
      text: strings.fullscreen.capitalize(),
      checkbox: values.fullscreen,
    },
    {
      key: 'liveAutoCompletion',
      text: strings['live autocompletion'].capitalize(),
      checkbox: values.liveAutoCompletion,
    },
    {
      key: 'showPrintMargin',
      text: strings['show print margin'].capitalize(),
      checkbox: values.showPrintMargin,
    },
    {
      key: 'teardropSize',
      text: strings['cursor controller size'],
      subText: values.teardropSize,
    },
    {
      key: 'scrolling',
      text: strings['scrolling'],
    }
  ];

  gen.listItems($settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    const settings = {};
    switch (this.key) {
      case 'autosave':
        dialogs
          .prompt(strings.delay + ' (>1000)', values.autosave, 'number')
          .then((res) => {
            res = parseInt(res);
            if (isNaN(res) || (res < 1000 && res !== 0))
              return dialogs.alert(strings.info, strings['invalid value']);
            appSettings.update({
              autosave: res,
            });
            this.changeSubText(res ? res + '' : strings.no);

            if (res) {
              if (saveInterval) clearInterval(saveInterval);
              saveInterval = setInterval(() => {
                editorManager.files.map((file) => {
                  if (file.isUnsaved && file.location)
                    acode.exec('save', false);
                });
              }, res);
            } else if (saveInterval) {
              clearInterval(saveInterval);
            }
          });
        break;

      case 'fontSize':
        dialogs
          .prompt(this.text, values.fontSize, 'text', {
            required: true,
            match: constants.FONT_SIZE,
          })
          .then((res) => {
            if (res === values.fontSize) return;

            appSettings.update({
              fontSize: res,
            });
            this.changeSubText(res);
          });
        break;

      case 'lineHeight':
        dialogs
          .prompt(this.text, values.lineHeight, 'numberic', {
            required: true,
          })
          .then((res) => {
            res = parseFloat(res);
            if (res < 1 || res === values.lineHeight) return;

            appSettings.update({
              lineHeight: res,
            });
            this.changeSubText(res);
          });
        break;

      case 'tabSize':
        dialogs
          .prompt(this.text, appSettings.value.tabSize, 'number', {
            required: true,
          })
          .then((res) => {
            if (res === values.tabSize) return;
            appSettings.update({
              tabSize: res,
            });
            this.changeSubText(res);
          });
        break;

      case 'formatOnSave':
        dialogs
          .select(this.text, [
            [true, strings.yes],
            [false, strings.no],
          ], {
            default: values.formatOnSave,
          })
          .then((res) => {
            this.value = res;
            appSettings.update({
              formatOnSave: res,
            });
            this.changeSubText(res ? strings.yes : strings.no);
          });
        break;

      case 'openFileListPos':
        dialogs
          .select(this.text, ['sidebar', 'header'], {
            default: values.openFileListPos,
          })
          .then((res) => {
            if (res === values.openFileListPos) return;
            appSettings.update({
              openFileListPos: res,
            });
            this.changeSubText(res);
          });
        break;

      case 'editorFont':
        dialogs
          .select(this.text, ['fira-code', 'default'], {
            default: values.editorFont,
          })
          .then((res) => {
            if (res === values.editorFont) return;
            appSettings.update({
              editorFont: res,
            });
            this.changeSubText(res);
          });
        break;

      case 'quickTools':
        acode.exec('toggle-quick-tools');
        this.value = values.quickTools;
        break;

      case 'fullscreen':
        appSettings.update({
          fullscreen: !values.fullscreen,
        });

        if (values.fullscreen) acode.exec('enable-fullscreen');
        else acode.exec('disable-fullscreen');

        this.value = values.fullscreen;
        break;

      case 'teardropSize':
        dialogs
          .select(
            strings['cursor controller size'],
            [
              [0, strings.none],
              [30, strings.small],
              [60, strings.large],
            ],
            {
              default: values.teardropSize,
            },
          )
          .then((res) => {
            appSettings.update({
              teardropSize: res,
            });
            this.value = res;
          });
        break;

      case 'scrolling':
        scrollSettings();
        break;

      default:
        settings[this.key] = !values[this.key];
        appSettings.update(settings);
        this.value = values[this.key];
        break;
    }
  }

  $page.body = $settingsList;
  app.append($page);
  helpers.showAd();
}
