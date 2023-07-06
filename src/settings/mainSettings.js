import About from '../pages/about';
import editorSettings from './editorSettings';
import backupRestore from './backupRestore';
import themeSetting from 'pages/themeSetting';
import otherSettings from './appSettings';
import defaultFormatter from './formatter';
import rateBox from 'dialogs/rateBox';
import Donate from 'pages/donate';
import plugins from 'pages/plugins';
import settingsPage from 'components/settingsPage';
import previewSettings from './previewSettings';
import removeAds from 'lib/removeAds';
import appSettings from 'lib/settings';
import helpers from 'utils/helpers';
import openFile from 'lib/openFile';
import settings from 'lib/settings';
import confirm from 'dialogs/confirm';
import actionStack from 'lib/actionStack';

export default function settingsMain() {
  const title = strings.settings.capitalize();
  let $list;

  const items = [
    {
      key: 'about',
      text: strings.about,
      icon: 'acode',
      index: 0,
    },
    {
      key: 'donate',
      text: strings.support,
      icon: 'favorite',
      iconColor: 'orangered',
      sake: true,
      index: 1,
    },
    {
      key: 'editor-settings',
      text: strings['editor settings'],
      icon: 'text_format',
      index: 3,
    },
    {
      key: 'app-settings',
      text: strings['app settings'],
      icon: 'tune',
      index: 2,
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
    },
    {
      key: 'reset',
      text: strings['restore default settings'],
      icon: 'historyrestore',
      index: 5,
    },
    {
      key: 'preview',
      text: strings['preview settings'],
      icon: 'play_arrow',
      index: 4,
    },
    {
      key: 'editSettings',
      text: `${strings['edit']} settings.json`,
      icon: 'edit',
    }
  ];

  if (IS_FREE_VERSION) {
    items.push({
      key: 'removeads',
      text: strings['remove ads'],
      icon: 'cancel',
    });
  }

  removeAds.callback = () => {
    $list.get('[data-key="removeads"]').remove();
  };

  async function callback(key) {
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

      case 'preview':
        previewSettings();
        break;

      case 'editSettings': {
        actionStack.pop();
        openFile(settings.settingsFile);
        break;
      }

      case 'reset':
        const confirmation = await confirm(strings.warning, strings['restore default settings']);
        if (confirmation) {
          await appSettings.reset();
          location.reload();
        }
        break;

      case 'removeads':
        removeAds()
          .then((error) => {
            helpers.error(error);
          });
        break;

      default:
        break;
    }
  }

  ({ $list } = settingsPage(title, items, callback));
}
