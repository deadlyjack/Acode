import tag from 'html-tag-js';
import Page from '../../components/page';
import dialogs from '../../components/dialogs';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';
import constants from '../../lib/constants';

export default function scrollSettings() {
  const values = appSettings.value;
  const $page = Page(strings['scroll settings']);
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
      key: 'scroll-speed',
      text: strings['scroll speed'],
      subText: getScrollSpeedString(values.scrollSpeed),
    },
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
    {
      key: 'textWrap',
      text: strings['text wrap'],
      checkbox: values.textWrap,
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

      case 'textWrap':
        this.value = !this.value;
        appSettings.update({
          textWrap: this.value,
        });
        break;

      case 'scroll-speed':
        dialogs
          .select(strings['scroll speed'], [
            [constants.SCROLL_SPEED_FAST, strings.fast],
            [constants.SCROLL_SPEED_NORMAL, strings.normal],
            [constants.SCROLL_SPEED_SLOW, strings.slow],
          ], {
            default: values.scrollSpeed,
          })
          .then((res) => {
            appSettings.update({
              scrollSpeed: res,
            });
            this.value = getScrollSpeedString(res);
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

function getScrollSpeedString(speed) {
  switch (speed) {
    case constants.SCROLL_SPEED_FAST:
      return strings.fast;
    case constants.SCROLL_SPEED_SLOW:
      return strings.slow;
    case constants.SCROLL_SPEED_NORMAL:
    default:
      return strings.normal;
  }
}