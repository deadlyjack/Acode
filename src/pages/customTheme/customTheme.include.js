import './customTheme.scss';
import tag from 'html-tag-js';
import Mustache from 'mustache';
import template from './customTheme.hbs';
import Page from '../../components/page';
import color from '../../components/dialogboxes/color';
import helpers from '../../utils/helpers';
import constants from '../../lib/constants';
import select from '../../components/dialogboxes/select';
import dialogs from '../../components/dialogs';
import appSettings from '../../lib/settings';

export default function CustomThemeInclude() {
  const $page = Page(`${strings['custom']} ${strings['theme']}`.capitalize());

  $page.header.append(
    tag('span', {
      className: 'icon historyrestore',
      attr: {
        action: 'reset-theme',
      },
      style: {
        color: 'red',
      },
    }),
    tag('span', {
      className: 'icon check',
      attr: {
        action: 'set-theme',
      },
    }),
  );

  render();
  app.append($page);
  helpers.showAd();

  actionStack.push({
    id: 'custom-theme',
    action: $page.hide,
  });

  $page.onhide = () => {
    actionStack.remove('custom-theme');
    helpers.hideAd();
  }

  $page.addEventListener('click', handleClick);

  /**
   * Handle click event
   * @param {MouseEvent | TouchEvent} e
   */
  function handleClick(e) {
    const $target = e.target;
    if ($target instanceof HTMLElement) {
      const action = $target.getAttribute('action');

      if (action === 'set-theme') {
        select(strings['theme type'], [
          ['light', strings['light']],
          ['dark', strings['dark']],
        ]).then((res) => {
          appSettings.update({
            appTheme: 'custom',
            customThemeMode: res,
          });
          updateTheme();
          const title = $page.header.text;
          if (title.slice(-1) === '*') {
            $page.header.text = title.slice(0, -1);
          }
        });
        return;
      }

      if (action === 'set-color') {
        const name = $target.getAttribute('name');
        const defaultValue = $target.getAttribute('value');
        color(defaultValue)
          .then((color) => {
            appSettings.value.customTheme[name] = color;
            appSettings.update();
            const scrolltop = $page.get('#custom-theme').scrollTop;
            render();
            $page.get('#custom-theme').scrollTop = scrolltop;
            const $color = $target.get('.icon.color');
            if ($color) {
              $color.style.color = color;
            }
            if ($page.header.text.slice(-1) !== '*') $page.header.text += ' *';
          });

        return;
      }

      if (action === 'reset-theme') {
        dialogs.confirm(strings['info'].toUpperCase(), strings['reset warning'])
          .then((confirmation) => {
            if (!confirmation) return;
            appSettings.reset('customTheme');
            render();
            updateTheme();
          });
      }
    }
  }

  function render() {
    const { customTheme } = appSettings;
    const { customTheme: userSaved } = appSettings.value;
    const colors = Object.keys(customTheme).map((color) => {
      return {
        color,
        value: userSaved[color] || customTheme[color],
        text: color.replace(/-/g, ' ').trim().capitalize(0),
      };
    });
    const html = Mustache.render(template, { colors });
    const $content = $page.get('#custom-theme');
    if ($content) $content.remove();
    $page.body = tag.parse(html);
  }

  function updateTheme() {
    tag.get('#custom-theme').textContent = helpers.jsonToCSS(
      constants.CUSTOM_THEME,
      appSettings.value.customTheme,
    );

    setTimeout(() => {
      restoreTheme();
    }, 1000);
  }
}
