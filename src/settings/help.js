import settingsPage from 'components/settingPage';

export default function help() {
  const title = strings.help;
  const items = [
    {
      key: 'help',
      text: strings.help,
      link: 'https://telegram.me/foxdebug_acode',
    },
    {
      key: 'faqs',
      text: strings.faqs,
      link: 'https://acode.foxdebug.com/faqs',
    },
  ];

  settingsPage(title, items, () => { });
}
