import settingsPage from '../components/settingPage';

export default function defaultFormatter(languageName) {
  const title = strings.formatter;
  const values = appSettings.value;
  const { formatters } = acode;
  const { modes } = ace.require('ace/ext/modelist');

  const items = modes.map((mode) => {
    const { name, caption } = mode;
    const formatter = values.formatter[name];
    const value = formatters.find((f) => f.id === formatter)?.name || strings.none;
    const extensions = mode.extensions.split('|');
    const options = acode.getFormatterFor(extensions);

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

  const { $list } = settingsPage(title, items, callback);
  if (!languageName) return;

  const $item = $list.get(`[data-key="${languageName}"]`);
  if (!$item) return;

  $item.scrollIntoView();
  $item.click();
}