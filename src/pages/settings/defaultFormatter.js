import tag from 'html-tag-js';
import Page from '../../components/page';
import dialogs from '../../components/dialogs';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';
import searchBar from '../../components/searchbar';

export default function defaultFormatter() {
  const values = appSettings.value;
  const $search = tag('i', {
    className: 'icon search',
    attr: {
      action: 'search',
    },
    onclick() {
      searchBar($settingsList);
    }
  });
  const $page = Page(strings.formatter);
  const $settingsList = tag('div', {
    className: 'main list',
  });

  $page.header.append($search);
  actionStack.push({
    id: 'formatter',
    action: $page.hide,
  });
  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('formatter');
  };

  const { formatters } = acode;
  const { modes, modesByName } = ace.require('ace/ext/modelist');

  const settingsOptions = modes.map((mode) => {
    const { name, caption } = mode;
    const formatter = values.formatter[name];
    const subText = formatters.find((f) => f.id === formatter)?.name || strings.none;
    return {
      key: name,
      text: caption,
      subText,
    };
  });

  gen.listItems($settingsList, settingsOptions, changeSetting);

  function changeSetting() {
    const { key } = this;
    const options = [[null, strings.none]];
    const mode = modesByName[key];
    const extensions = mode.extensions.split('|');
    const value = values.formatter[key] || null;

    formatters.forEach(({ id, name, exts }) => {
      const supports = exts.some((ext) => extensions.includes(ext));
      if (supports || exts.includes('*')) {
        options.push([id, name]);
      }
    });

    dialogs.select(strings.formatter, options, {
      default: value,
    }).then((res) => {
      values.formatter[key] = res;
      appSettings.update();
      const subtext = formatters.find(({ id }) => id === res)?.name || strings.none;
      this.value = subtext;
    });
  }

  $page.body = $settingsList;
  app.append($page);
  helpers.showAd();
}