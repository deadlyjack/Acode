import About from '../pages/about/about';
import editorSettings from './editorSettings';
import constants from '../lib/constants';
import backupRestore from './backup-restore';
import themeSetting from '../pages/themeSetting/themeSetting';
import otherSettings from './appSettings';
import defaultFormatter from './defaultFormatter';
import rateBox from '../components/dialogboxes/rateBox';
import Donate from '../pages/donate/donate';
import plugins from '../pages/plugins/plugins';
import settingsPage from '../components/settingPage';

export default function settingsMain() {
  const title = strings.settings.capitalize();

  const items = [
    {
      key: 'about',
      text: strings.about,
      icon: 'acode',
    },
    {
      key: 'donate',
      text: strings.support,
      icon: 'favorite',
      iconColor: 'orangered',
      sake: true
    },
    {
      key: 'editor-settings',
      text: strings['editor settings'],
      icon: 'text_format',
    },
    {
      key: 'app-settings',
      text: strings['app settings'],
      icon: 'tune',
    },
    {
      key: 'formatter',
      text: strings.formatter,
      icon: 'stars',
    },
    {
      key: 'theme',
      text: strings.theme,
      icon: 'color_lenspalette',
    },
    {
      key: 'backup-restore',
      text: strings.backup.capitalize() + '/' + strings.restore.capitalize(),
      icon: 'cached',
    },
    {
      key: 'rateapp',
      text: strings['rate acode'],
      icon: 'googleplay'
    },
    {
      key: 'plugins',
      text: strings['plugins'],
      icon: 'extension',
    }
  ];

  if (IS_FREE_VERSION) {
    items.push({
      key: 'removeads',
      text: strings['remove ads'],
      icon: 'cancel',
      link: constants.PAID_VERSION,
    });
  }

  function callback(key) {
    switch (key) {
      case 'editor-settings':
        editorSettings();
        break;

      case 'theme':
        themeSetting();
        break;

      case 'about':
        About();
        break;

      case 'app-settings':
        otherSettings();
        break;

      case 'backup-restore':
        backupRestore();
        break;

      case 'donate':
        Donate();
        break;

      case 'rateapp':
        rateBox();
        break;

      case 'plugins':
        plugins();
        break;

      case 'formatter':
        defaultFormatter();
        break;

      default:
        break;
    }
  }

  settingsPage(title, items, callback);
}