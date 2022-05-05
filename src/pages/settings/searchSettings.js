import Page from '../../components/page';
import tag from 'html-tag-js';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';

export default function searchSettings() {
  const $page = Page(strings.search.capitalize());
  const settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'settings-search',
    action: $page.hide,
  });
  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('settings-search');
  };

  const values = appSettings.value.search;

  const settingsOptions = [
    {
      key: 'case sensitive',
      text: 'Case sensitive',
      checkbox: values.caseSensitive,
    },
    {
      key: 'regexp',
      text: 'RegExp',
      checkbox: values.regExp,
    },
    {
      key: 'wholeWord',
      text: 'Whole word',
      checkbox: values.wholeWord,
    },
  ];

  gen.listItems(settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    switch (this.key) {
      case 'case sensitive':
        values.caseSensitive = !values.caseSensitive;
        appSettings.update();
        this.value = values.caseSensitive;
        break;

      case 'regexp':
        values.regExp = !values.regExp;
        appSettings.update();
        this.value = values.regExp;
        break;

      case 'wholeWord':
        values.wholeWord = !values.wholeWord;
        appSettings.update();
        this.value = values.wholeWord;
        break;

      default:
        break;
    }
  }

  $page.appendChild(settingsList);
  app.append($page);
  helpers.showAd();
}
