import helpers from '../utils/helpers';
import constants from '../lib/constants';
import settingsPage from '../components/settingPage';

export default function help() {
  const title = strings.help;
  const items = [
    {
      key: 'feedback',
      text: strings.feedback,
    },
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

  function callback(key) {
    if (key === 'feedback') {
      const subject = 'feedback - Acode editor';
      const textBody = helpers.getFeedbackBody('<br/>%0A');
      const email = constants.FEEDBACK_EMAIL;
      system.openInBrowser(
        `mailto:${email}?subject=${subject}&body=${textBody}`,
      );
    }
  }

  settingsPage(title, items, callback);
}
