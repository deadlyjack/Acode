import './customTheme.scss';
import tag from 'html-tag-js';
import Mustache from 'mustache';
import template from './customTheme.hbs';
import Page from '../../components/page';
import color from '../../components/dialogboxes/color';
import helpers from '../../lib/utils/helpers';
import constants from '../../lib/constants';
import confirm from '../../components/dialogboxes/confirm';
import select from '../../components/dialogboxes/select';

export default function CustomThemeInclude() {
  const $page = Page(`${strings['custom']} ${strings['theme']}`.capitalize());
  let unsaved = false;

  $page.get('header').append(
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
        color(defaultValue).then((color) => {
          appSettings.value.customTheme[name] = color;
          appSettings.update();
          const scrolltop = $page.get('#custom-theme').scrollTop;
          render();
          $page.get('#custom-theme').scrollTop = scrolltop;
          if ($page.header.text.slice(-1) !== '*') $page.header.text += ' *';
        });

        return;
      }

      if (action === 'reset-theme') {
        confirm(strings['info'].toUpperCase(), strings['reset warning']).then(
          () => {
            appSettings.reset('customTheme');
            render();
            updateTheme();
          },
        );
      }
    }
  }

  function render() {
    const customThemeColor = appSettings.value.customTheme;
    const colors = Object.keys(customThemeColor).map((color) => {
      return {
        color,
        value: customThemeColor[color],
        text: color.replace(/-/g, ' ').trim(),
      };
    });
    const html = Mustache.render(template, { colors });
    const $content = $page.get('#custom-theme');
    if ($content) $content.remove();
    $page.append(tag.parse(html));
  }

  function updateTheme() {
    tag.get('#custom-theme').textContent = helpers.jsonToCSS(
      constants.CUSTOM_THEME,
      appSettings.value.customTheme,
    );

    window.restoreTheme();
  }
}
