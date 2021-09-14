import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import gen from '../../components/gen';
import About from '../about/about';
import editorSettings from './editorSettings';
import constants from '../../lib/constants';
import openFile from '../../lib/openFile';
import backupRestore from './backup-restore';
import themeSetting from '../themeSetting/themeSetting';
import $_ad from '../../views/ad.hbs';
import otherSettings from './otherSettings';
import $_socialLinks from '../../views/social-links.hbs';

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
  $page.onhide = function () {
    actionStack.remove('settings-main');
  };
  $page.querySelector('header').append($editSettings);

  const settingsOptions = [
    {
      key: 'editor',
      text: strings['editor settings'],
      icon: 'text_format',
    },
    {
      key: 'theme',
      text: strings.theme,
      icon: 'color_lenspalette',
    },
    {
      key: 'about',
      text: strings.about,
      icon: 'acode',
    },
    {
      key: 'backup-restore',
      text: strings.backup.capitalize() + '/' + strings.restore.capitalize(),
      icon: 'cached',
    },
    {
      key: 'other-settings',
      text: strings['other settings'],
      icon: 'tune',
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
      case 'editor':
        editorSettings();
        break;

      case 'theme':
        themeSetting();
        break;

      case 'about':
        About();
        break;

      case 'other-settings':
        otherSettings();
        break;

      case 'backup-restore':
        backupRestore();
        break;
    }
  }

  $page.appendChild($settingsList);
  if (window.promotion && !localStorage.hideAd) {
    const $ad = tag.parse(mustache.render($_ad, window.promotion));
    $ad.onclick = function (e) {
      const action = e.target.getAttribute('action');
      if (action === 'close') {
        this.remove();
        localStorage.hideAd = true;
      }
    };
    $settingsList.append($ad);
  }
  $settingsList.appendChild(tag.parse($_socialLinks));
  document.body.append($page);
}
