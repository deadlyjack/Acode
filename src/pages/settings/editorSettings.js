import Page from '../../components/page';
import gen from '../../components/gen';
import dialogs from '../../components/dialogs';
import constants from '../../lib/constants';
import tag from 'html-tag-js';

export default function editorSettings() {
  const $page = Page(strings['editor settings'].capitalize());
  const settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'settings-editor',
    action: $page.hide,
  });
  $page.onhide = function () {
    actionStack.remove('settings-editor');
  };

  let values = appSettings.value;

  appSettings.on('update', function (newValues) {
    values = newValues;
  });

  const settingsOptions = [
    {
      key: 'animation',
      text: strings.animation.capitalize(),
      checkbox: values.animation,
    },
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
      key: 'beautify',
      text: strings['beautify on save'],
      subText: strings.except + ': ' + values.beautify.join(','),
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
      key: 'vibrateOnTap',
      text: strings['vibrate on tap'],
      checkbox: values.vibrateOnTap,
    },
    {
      key: 'floatingButton',
      text: strings['floating button'],
      checkbox: values.floatingButton,
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
      key: 'cursorControllerSize',
      text: strings['cursor controller size'],
      subText: values.cursorControllerSize,
    },
    {
      key: 'scrollbarSize',
      text: strings['scrollbar size'],
      subText: values.scrollbarSize,
    },
  ];

  gen.listItems(settingsList, settingsOptions, changeSetting);

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
                    Acode.exec('save', false);
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

      case 'beautify':
        dialogs
          .prompt(strings.except + ' (eg. php,py)', values.beautify.join(','))
          .then((res) => {
            const files = res.split(',');
            files.map((file, i) => (files[i] = file.trim().toLowerCase()));
            appSettings.update({
              beautify: files,
            });
            this.changeSubText(strings.except + ': ' + res);
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
        Acode.exec('toggle-quick-tools');
        this.value = values.quickTools;
        break;

      case 'fullscreen':
        appSettings.update({
          fullscreen: !values.fullscreen,
        });

        if (values.fullscreen) Acode.exec('enable-fullscreen');
        else Acode.exec('disable-fullscreen');

        this.value = values.fullscreen;
        break;

      case 'animation':
        appSettings.update({
          animation: !values.animation,
        });
        app.classList.toggle('no-animation');
        this.value = values.animation;
        break;

      case 'floatingButton':
        appSettings.update({
          floatingButton: !values.floatingButton,
        });
        root.classList.toggle('hide-floating-button');
        this.value = values.floatingButton;
        break;

      case 'cursorControllerSize':
        dialogs
          .select(
            strings['cursor controller size'],
            [
              [strings.none, 'none'],
              [strings.small, 'small'],
              [strings.large, 'large'],
            ],
            {
              default: values.cursorControllerSize,
            },
          )
          .then((res) => {
            appSettings.update({
              cursorControllerSize: res,
            });
            this.value = res;
          });
        break;

      case 'scrollbarSize':
        dialogs
          .select(strings['scrollbar size'], [5, 10, 15, 20], {
            default: values.scrollbarSize,
          })
          .then((res) => {
            appSettings.update({
              scrollbarSize: res,
            });
            this.value = res;
          });
        break;

      default:
        settings[this.key] = !values[this.key];
        appSettings.update(settings);
        this.value = values[this.key];
        break;
    }
  }

  $page.appendChild(settingsList);
  document.body.append($page);

  document.body.append($page);
}
