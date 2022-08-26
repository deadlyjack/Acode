import settingsPage from '../components/settingPage';

export default function filesSettings() {
  const title = strings.settings;
  const values = appSettings.value.fileBrowser;

  const items = [
    {
      key: 'sortByName',
      text: strings['sort by name'],
      checkbox: values.sortByName,
    },
    {
      key: 'showHiddenFiles',
      text: strings['show hidden files'],
      checkbox: values.showHiddenFiles,
    },
  ];


  function callback(key, value) {
    appSettings.value.fileBrowser[key] = value;
    appSettings.update();
  }

  settingsPage(title, items, callback);
}
