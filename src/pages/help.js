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
    helpers.hideAd();
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
      system.openInBrowser(
        `mailto:${email}?subject=${subject}&body=${textBody}`,
      );
    } else if (this.key === 'help') {
      system.openInBrowser('https://t.me/foxdebug_acode');
    } else if (this.key === 'faqs') {
      system.openInBrowser('https://acode.foxdebug.com/faqs');
    }
  }

  page.append(options);
  app.append(page);
  helpers.showAd();
}
