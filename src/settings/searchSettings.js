import settingsPage from '../components/settingPage';
import appSettings from '../lib/settings';

export default function searchSettings() {
  const title = strings.search;
  const values = appSettings.value.search;
  const items = [
    {
      key: 'caseSensitive',
      text: strings['case sensitive'],
      checkbox: values.caseSensitive,
    },
    {
      key: 'regExp',
      text: strings['regular expression'],
      checkbox: values.regExp,
    },
    {
      key: 'wholeWord',
      text: strings['whole word'],
      checkbox: values.wholeWord,
    },
  ];

  function callback(key, value) {
    values[key] = value;
    appSettings.update();
  }

  settingsPage(title, items, callback);
}
