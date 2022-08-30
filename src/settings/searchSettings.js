import settingsPage from '../components/settingPage';

export default function searchSettings() {
  const title = strings.search;
  const values = appSettings.value.search;
  const items = [
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

  function callback(key, value) {
    values[key] = value;
    appSettings.update();
  }

  settingsPage(title, items, callback);
}
