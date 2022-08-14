import settingsPage from '../components/settingPage';

export default function filesSettings(callback) {
  const title = strings.settings.capitalize();
  const values = appSettings.value.fileBrowser;

  const items = [
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


  function callback(key, value) {
    appSettings.update({
      [key]: value,
    });
    if (callback) callback();
  }

  settingsPage(title, items, callback);
}
