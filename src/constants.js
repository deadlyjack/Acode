const FILE_NAME_REGEX = /^((?![:<>"\/\\\|\?\*]).)*$/;
const FONT_SIZE = /^[0-9]{1,2}(px|em|pt|mm|pc|in)$/;
const langList = {
  'hi-in': 'हिंदी',
  'en-us': 'English',
  'id-id': 'Indonesian',
  'ru-ru': 'Русский',
  'uk-ua': 'Українська',
  'zh-cn': '中文简体'
};
const themeList = ["ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt", "crimson_editor", "dawn", "dracula", "dreamweaver", "eclipse", "github", "gob", "gruvbox", "idle_fingers", "iplastic", "katzenmilch", "kr_theme", "kuroir", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "sqlserver", "terminal", "textmate", "tomorrow", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink", "xcode"];

export default {
  FILE_NAME_REGEX,
  FONT_SIZE,
  themeList,
  langList
};