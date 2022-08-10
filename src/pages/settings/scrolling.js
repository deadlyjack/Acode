import tag from 'html-tag-js';
import Page from '../../components/page';
import dialogs from '../../components/dialogs';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';

export default function scrollSettings() {
  const values = appSettings.value;
  const $page = Page(strings.scrolling);
  const $settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'scroll-settings',
    action: $page.hide,
  });
  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('scroll-settings');
  };

  const settingsOptions = [
    {
      key: 'reverse-scrolling',
      text: strings['reverse scrolling'],
      checkbox: values.reverseScrolling,
    },
    {
      key: 'diagonal-scrolling',
      text: strings['diagonal scrolling'],
      checkbox: values.diagonalScrolling,
    },
    {
      key: 'scrollbarSize',
      text: strings['scrollbar size'],
      subText: values.scrollbarSize,
    },
  ];

  gen.listItems($settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    switch (this.key) {
      case 'reverse-scrolling':
        this.value = !this.value;
        appSettings.update({
          reverseScrolling: this.value,
        });
        break;

      case 'diagonal-scrolling':
        this.value = !this.value;
        appSettings.update({
          diagonalScrolling: this.value,
        });
        break;

      case 'scrollbarSize':
        dialogs
          .select(strings['scrollbar size'], [5, 10, 15, 20], {
            default: values.scrollbarSize,
          })
          .then((res) => {
            appSettings.update({
              scrollbarSize: res,
            });
            this.value = res;
          });
        break;

      default:
        break;
    }
  }

  $page.body = $settingsList;
  app.append($page);
  helpers.showAd();
}