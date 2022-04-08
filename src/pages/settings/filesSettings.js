import Page from '../../components/page';
import tag from 'html-tag-js';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';

export default function filesSettings(callback) {
  const page = Page(strings.settings.capitalize());
  const settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'settings-theme',
    action: page.hide,
  });
  page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('settings-theme');
  };

  const values = appSettings.value.fileBrowser;

  const settingsOptions = [
    {
      key: 'sort',
      text: strings['sort by name'],
      checkbox: values.sortByName,
    },
    {
      key: 'show',
      text: strings['show hidden files'],
      checkbox: values.showHiddenFiles,
    },
  ];

  gen.listItems(settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    switch (this.key) {
      case 'sort':
        values.sortByName = !values.sortByName;
        appSettings.update();
        this.value = values.sortByName;
        if (callback) callback();
        break;

      case 'show':
        values.showHiddenFiles = !values.showHiddenFiles;
        appSettings.update();
        this.value = values.showHiddenFiles;
        if (callback) callback();
        break;
    }
  }

  page.appendChild(settingsList);
  app.append(page);
  helpers.showAd();
}
