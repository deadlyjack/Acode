import tag from 'html-tag-js';
import Page from '../components/page';
import gen from '../components/gen';
import helpers from '../lib/utils/helpers';
import constants from '../lib/constants';

export default function help() {
  const page = Page(strings.help.capitalize());
  const options = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'help',
    action: page.hide,
  });
  page.onhide = function () {
    actionStack.remove('help');
  };

  const settingsOptions = [
    {
      key: 'feedback',
      text: 'Feedback',
    },
    {
      key: 'help',
      text: strings.help,
    },
    {
      key: 'faqs',
      text: 'FAQs',
    },
  ];

  gen.listItems(options, settingsOptions, changeSetting);

  function changeSetting() {
    if (this.key === 'feedback') {
      const subject = 'feedback - Acode editor';
      const textBody = helpers.getFeedbackBody('<br/>%0A');
      const email = constants.FEEDBACK_EMAIL;
      window.open(
        `mailto:${email}?subject=${subject}&body=${textBody}`,
        '_system'
      );
    } else if (this.key === 'help') {
      window.open('https://t.me/foxdebug_acode', '_system');
    } else if (this.key === 'faqs') {
      window.open('https://acode.foxdebug.com/faqs', '_system');
    }
  }

  page.append(options);
  document.body.append(page);
}
