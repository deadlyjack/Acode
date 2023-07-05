import settingsPage from 'components/settingsPage';
import appSettings from 'lib/settings';

export default function defaultFormatter(languageName) {
  const title = strings.formatter;
  const values = appSettings.value;
  const { formatters } = acode;
  const { modes } = ace.require('ace/ext/modelist');

  const items = modes.map((mode) => {
    const { name, caption } = mode;
    const formatterID = values.formatter[name] || null;
    const extensions = mode.extensions.split('|');
    const options = acode.getFormatterFor(extensions);


    return {
      key: name,
      text: caption,
      icon: `file file_type_default file_type_${name}`,
      value: formatterID,
      valueText: (value) => {
        const formatter = formatters.find(({ id }) => id === value);
        if (formatter) {
          return formatter.name;
        }
        return strings.none;
      },
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