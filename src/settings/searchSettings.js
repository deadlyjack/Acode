import settingsPage from '../components/settingPage';

export default function searchSettings() {
  const title = strings.search.capitalize();
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
    appSettings.update({
      [key]: value,
    });
  }

  settingsPage(title, items, callback);
}
