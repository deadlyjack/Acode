import settingsPage from '../components/settingPage';

export default function defaultFormatter() {
  const title = strings.formatter;
  const values = appSettings.value;
  const { formatters } = acode;
  const { modes } = ace.require('ace/ext/modelist');

  const items = modes.map((mode) => {
    const { name, caption } = mode;
    const formatter = values.formatter[name];
    const value = formatters.find((f) => f.id === formatter)?.name || strings.none;
    const extensions = mode.extensions.split('|');
    const options = [[null, strings.none]];
    formatters.forEach(({ id, name, exts }) => {
      const supports = exts.some((ext) => extensions.includes(ext));
      if (supports || exts.includes('*')) {
        options.push([id, name]);
      }
    });

    return {
      key: name,
      text: caption,
      value,
      valueText: (value) => formatters.find(({ id }) => id === value)?.name || strings.none,
      select: options
    };
  });

  function callback(key, value) {
    values.formatter[key] = value;
    appSettings.update();
  }

  settingsPage(title, items, callback);
}