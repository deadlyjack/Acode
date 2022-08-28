import constants from '../lib/constants';
import scrollSettings from './scrollSettings';
import settingsPage from '../components/settingPage';

export default function editorSettings() {
  const title = strings['editor settings'];
  const values = appSettings.value;
  const items = [
    {
      key: 'autosave',
      text: strings.autosave.capitalize(),
      value: values.autosave,
      valueText: (value) => value ? value : strings.no,
      prompt: strings.delay + ' (>=1000 || 0)',
      promptType: 'number',
      promptOptions: {
        test(value) {
          value = parseInt(value);
          return value >= 1000 || value == 0;
        }
      },
    },
    {
      key: 'fontSize',
      text: strings['font size'],
      value: values.fontSize,
      prompt: strings['font size'],
      promptOptions: {
        required: true,
        match: constants.FONT_SIZE,
      },
    },
    {
      key: 'softTab',
      text: strings['soft tab'],
      checkbox: values.softTab,
    },
    {
      key: 'tabSize',
      text: strings['tab size'],
      value: values.tabSize,
      prompt: strings['tab size'],
      promptType: 'number',
      promptOptions: {
        test(value) {
          value = parseInt(value);
          return value >= 1 && value <= 8;
        }
      },
    },
    {
      key: 'linenumbers',
      text: strings['show line numbers'],
      checkbox: values.linenumbers,
    },
    {
      key: 'lineHeight',
      text: strings['line height'],
      value: values.lineHeight,
      prompt: strings['line height'],
      promptType: 'number',
      promptOptions: {
        test(value) {
          value = parseFloat(value);
          return value >= 1 && value <= 2;
        }
      },
    },
    {
      key: 'formatOnSave',
      text: strings['format on save'],
      checkbox: values.formatOnSave,
    },
    {
      key: 'showSpaces',
      text: strings['show spaces'],
      checkbox: values.showSpaces,
    },
    {
      key: 'editorFont',
      text: strings['editor font'],
      value: values.editorFont,
      select: [
        'Fira Code',
        'Roboto Mono',
        'Source Code'
      ],
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
      value: values.teardropSize,
      valueText: (value) => {
        switch (value) {
          case 0:
            return strings.none;

          case 30:
            return strings.small;

          case 60:
            return strings.large;

          default:
            break;
        }
      },
      select: [
        [0, strings.none],
        [30, strings.small],
        [60, strings.large],
      ],
    },
    {
      index: 0,
      key: 'scroll-settings',
      text: strings['scroll settings'],
    }
  ];

  function callback(key, value) {
    switch (key) {
      case 'scroll-settings':
        scrollSettings();
        break;

      case 'fullscreen':
        if (value) acode.exec('enable-fullscreen');
        else acode.exec('disable-fullscreen');

      default:
        appSettings.update({
          [key]: value,
        });
        break;
    }
  }

  settingsPage(title, items, callback);
}
