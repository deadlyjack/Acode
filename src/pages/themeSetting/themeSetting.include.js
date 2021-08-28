import './themeSetting.scss';
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import constants from '../../lib/constants';
import $_template from './themeSetting.hbs';
import $_list_item from './list-item.hbs';
import searchBar from '../../components/searchbar';
import dialogs from '../../components/dialogs';
import CustomTheme from '../customTheme/customTheme';

export default function () {
  const $page = Page(strings.theme.capitalize());
  const $container = tag.parse($_template, {});
  const $search = tag('i', {
    className: 'icon search',
    attr: {
      action: 'search',
    },
  });
  const $themePreview = tag('div', {
    id: 'theme-preview',
  });
  let editor = ace.edit($themePreview);

  editor.setTheme(appSettings.value.editorTheme);
  editor.setFontSize(appSettings.value.fontSize);
  editor.session.setOptions({
    mode: 'ace/mode/javascript',
  });
  editor.setReadOnly(true);
  editor.session.setValue(
    'function foo(){\n' +
      '\tconst array = [1, 1, 2, 3, 5, 5, 1];\n' +
      '\tconst uniqueArray = [...new Set(array)];\n' +
      '\tconsole.log(uniqueArray);\n' +
      '\tconsole.log(0.2 + 0.1 === 0.3);\n' +
      "\tconsole.log('I love Acode editor')\n" +
      '}\n' +
      'foo();'
  );
  editor.gotoLine(8);
  $themePreview.append(
    tag('div', {
      id: 'theme-preview-header',
    })
  );
  $themePreview.classList.add(appSettings.value.editorFont);

  actionStack.push({
    id: 'appTheme',
    action: () => {
      editor.destroy();
      $page.hide();
      $page.removeEventListener('click', clickHandler);
    },
  });

  $page.onhide = () => actionStack.remove('appTheme');
  $page.append($container);
  $page.querySelector('header').append($search);

  app.append($page);

  $page.addEventListener('click', clickHandler);
  render();

  function render(mode = 'app') {
    let themeList = [],
      html = '',
      defaultValue = () => false;

    if (mode === 'editor' && innerHeight * 0.3 >= 120)
      $container.append($themePreview);
    else $themePreview.remove();

    if (mode === 'app') {
      if (!DOES_SUPPORT_THEME)
        html =
          '<div class="list-item">' +
          '<span class="icon warningreport_problem"></span>' +
          '<div class="container">' +
          '<span class="text">' +
          strings['unsupported device'] +
          '</span>' +
          '</div>' +
          '</div>';

      themeList = constants.appThemeList;
      defaultValue = (theme) => appSettings.value.appTheme === theme;
    } else if (mode === 'editor') {
      themeList = constants.editorThemeList;
      defaultValue = (theme) =>
        appSettings.value.editorTheme === `ace/theme/${theme}`;
    } else if (mode === 'md') {
    }

    const themes = Object.keys(themeList).sort();
    for (let i = 0; i < themes.length; ++i) {
      const theme = themes[i];
      let paid = false;
      let disable = false;
      const themeData = themeList[theme];

      if (mode === 'app') {
        paid = IS_FREE_VERSION && !themeData.isFree;
        disable = !DOES_SUPPORT_THEME;
      }

      html += mustache.render($_list_item, {
        name: theme.replace(/_/g, ' ').capitalize(),
        theme,
        mode,
        type: themeData.type,
        default: defaultValue(theme),
        disable,
        paid,
      });
    }
    $page.get('#theme-list').innerHTML = html;
  }

  /**
   *
   * @param {MouseEvent} e
   */
  function clickHandler(e) {
    const $target = e.target;
    if (!($target instanceof HTMLElement)) return;
    const action = $target.getAttribute('action');
    if (!action) return;

    switch (action) {
      case 'select':
        const $el = $page.get('.options>.active');
        if ($el) $el.classList.remove('active');
        $target.classList.add('active');
        render($target.getAttribute('value'));
        break;

      case 'select-theme':
        const mode = $target.getAttribute('mode');
        const theme = $target.getAttribute('name');
        const type = $target.getAttribute('type');
        if (mode === 'app') onSelectAppTheme(theme, type);
        else if (mode === 'editor') onSelectEditorTheme(theme, type);
        else if (mode === 'md') {
        }
        break;

      case 'search':
        searchBar($page.get('#theme-list'));
        break;

      default:
        break;
    }
  }

  function onSelectEditorTheme(res) {
    updateTheme('editor', res);
  }

  /**
   * Selects app theme
   *
   * @param {String} res
   * @param {String} type
   * @returns
   */
  function onSelectAppTheme(res, type) {
    const theme = constants.appThemeList[res];
    if (!theme) return;

    const link =
      'https://play.google.com/store/apps/details?id=com.foxdebug.acode';
    if (!theme.isFree && IS_FREE_VERSION) {
      dialogs
        .box(
          strings.info.toUpperCase(),
          'Hi dear user, dark modes are available in paid version of the app. ' +
            '<strong>DO NOT PANIC!</strong> The project is open source, you can build your own apk with all ' +
            'the features you need. Please support this project by ' +
            'buying the paid version.'
        )
        .onhide(() => {
          window.open(link, '_system');
        });
      return;
    }

    if (type === 'custom') {
      CustomTheme();
      return;
    }
    updateTheme('app', theme.name);
  }

  function updateTheme(mode, theme) {
    const setting = {};
    let oldTheme;
    if (mode === 'app') {
      setting.appTheme = theme;
      oldTheme = appSettings.value.appTheme;
    } else if (mode === 'editor') {
      const themeId = 'ace/theme/' + theme;
      editorManager.editor.setTheme(themeId);
      editor.setTheme(themeId);
      setting.editorTheme = themeId;
      oldTheme = appSettings.value.editorTheme.split('/').pop();
    } else return;

    const $checkIcon = tag.get(`#theme-list>[name="${oldTheme}"]>.icon.check`);
    if ($checkIcon) $checkIcon.remove();

    appSettings.update(setting);
    if (mode === 'app') window.restoreTheme();

    tag.get(`#theme-list>[name="${theme}"]`).innerHTML +=
      '<span class="icon check"></span>';
  }
}
