import tag from 'html-tag-js';
import Page from '../../components/page';
import gen from '../../components/gen';
import About from '../about/about';
import editorSettings from './editorSettings';
import constants from '../../lib/constants';
import openFile from '../../lib/openFile';
import backupRestore from './backup-restore';
import themeSetting from '../themeSetting/themeSetting';
import otherSettings from './otherSettings';
import $_socialLinks from '../../views/social-links.hbs';
import rateBox from '../../components/dialogboxes/rateBox';
import Donate from '../donate/donate';
import helpers from '../../lib/utils/helpers';
import plugins from '../plugins/plugins';

export default function settingsMain() {
  const $page = Page(strings.settings.capitalize());
  const $settingsList = tag('div', {
    className: 'main list',
    style: {
      textTransform: 'capitalize',
    },
  });
  const $editSettings = tag('span', {
    className: 'icon edit',
    attr: {
      style: 'font-size: 1.2em !important;',
      action: 'edit-settings',
    },
    onclick: () => {
      openFile(appSettings.settingsFile, {
        text: JSON.stringify(appSettings.value, undefined, 4),
        render: true,
        isUnsaved: false,
      }).then(() => {
        actionStack.pop();
      });
    },
  });

  actionStack.push({
    id: 'settings-main',
    action: $page.hide,
  });
  $page.querySelector('header').append($editSettings);

  const settingsOptions = [
    {
      index: 0,
      key: 'about',
      text: strings.about,
      icon: 'acode',
    },
    {
      index: 1,
      key: 'donate',
      text: strings.support,
      icon: 'favorite',
      color: 'orangered',
      sake: true
    },
    {
      index: 2,
      key: 'editor-settings',
      text: strings['editor settings'],
      icon: 'text_format',
    },
    {
      index: 3,
      key: 'app-settings',
      text: strings['app settings'],
      icon: 'tune',
    },
    {
      index: 4,
      key: 'theme',
      text: strings.theme,
      icon: 'color_lenspalette',
    },
    {
      index: 5,
      key: 'backup-restore',
      text: strings.backup.capitalize() + '/' + strings.restore.capitalize(),
      icon: 'cached',
    },
    {
      index: 6,
      key: 'rateapp',
      text: strings['rate acode'],
      icon: 'googleplay'
    },
    {
      index: 7,
      key: 'plugins',
      text: strings['plugins'],
      icon: 'extension',
    }
  ];
  gen.listItems($settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    const lanuguages = [];
    const langList = constants.langList;
    for (let lang in langList) {
      lanuguages.push([lang, langList[lang]]);
    }
    switch (this.key) {
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

      default:
        break;
    }
  }

  $page.appendChild($settingsList);
  $settingsList.appendChild(tag.parse($_socialLinks));
  app.append($page);
  helpers.showAd();

  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('settings-main');
  };
}
