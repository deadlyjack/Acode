const FILE_NAME_REGEX = /^((?![:<>"\/\\\|\?\*]).)*$/;
const FONT_SIZE = /^[0-9]{1,2}(px|em|pt|mm|pc|in)$/;
const HEX_COLOR = /^#([a-f0-9]{3}){1,2}([a-f0-9]{2})?$/i;
const RGB_COLOR = /^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(\s*,\s*\d?(\.\d+)?)?\)$/i;
const HSL_COLOR = /^hsla?\(([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(\s*,\s*\d?(\.\d+)?)?\)$/i;
const DEFAULT_SESSION = "default-session";
const DEFAULT_FILE_NAME = "untitled.txt";
const RATING_TIME = 5;
const CONSOLE_PORT = 8159;
const PORT = 8158;
const VIBRATION_TIME = 30;
const encodings = ["big5", "euc-jp", "euc-kr", "gb18030", "hz-gb-2312", "ibm866", "iso-2022-jp", "iso-8859-10", "iso-8859-13", "iso-8859-14", "iso-8859-15", "iso-8859-16", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6", "iso-8859-7", "iso-8859-8", "iso-8859-8-i", "koi8-r", "koi8-u", "macintosh", "shift_jis", "utf-16be", "utf-16le", "utf-8", "windows-1250", "windows-1251", "windows-1252", "windows-1253", "windows-1254", "windows-1255", "windows-1256", "windows-1257", "windows-1258", "windows-874", "x-mac-cyrillic"];
const langList = {
  "hi-in": "हिंदी",
  "en-us": "English",
  "id-id": "Indonesian",
  "ru-ru": "Русский",
  "pt-br": "Português",
  "uk-ua": "Українська",
  "zh-cn": "中文简体",
  "ir-fa": "فارسی",
  "ar-ye": "العربية",
  "ja-jp": "日本語",
  "uz-uz": "O'zbekcha",
  "es-sv": "Español",
  "tr-tr": "Türkçe"
};
const themeList = {
  dark: ["ambiance", "chaos", "clouds_midnight", "cobalt", "dracula", "gob", "gruvbox", "idle_fingers", "kr_theme", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "nord_dark", "pastel_on_dark", "solarized_dark", "terminal", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink"],
  light: ["chrome", "clouds", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "iplastic", "katzenmilch", "kuroir", "solarized_light", "sqlserver", "textmate", "tomorrow", "xcode"]
};

/**
 * @type {AppThemeList}
 */
const appThemeList = {
  "default": scheme("default", "light", true, "#5c5c99", "#9999ff"),
  "light": scheme("light", "light", true, "#999999", "#ffffff"),
  "atticus": scheme("atticus", "dark", false, "#201e1e", "#363333"),
  "bump": scheme("bump", "dark", false, "#1c2126", "#303841"),
  "bling": scheme("bling", "dark", false, "#131326", "#202040"),
  "dark": scheme("dark", "dark", false, "#1d1d1d", "#313131"),
  "moon": scheme("moon", "dark", false, "#14181d", "#222831"),
  "ocean": scheme("ocean", "dark", false, "#13131a", "#20202c"),
  "tomyris": scheme("tomyris", "dark", false, "#230528", "#3b0944")
};

/**
 * 
 * @param {string} type 
 * @param {"light"|"dark"} type 
 * @param {boolean} isFree 
 * @param {string} darkenMode 
 * @param {string} primary 
 * @returns {ThemeData}
 */
function scheme(name, type, isFree, darkenMode, primary) {
  return {
    name,
    type,
    isFree,
    darken: darkenMode,
    primary
  };
}

export default {
  FILE_NAME_REGEX,
  FONT_SIZE,
  HEX_COLOR,
  RGB_COLOR,
  HSL_COLOR,
  DEFAULT_SESSION,
  RATING_TIME,
  CONSOLE_PORT,
  PORT,
  DEFAULT_FILE_NAME,
  VIBRATION_TIME,
  themeList,
  appThemeList,
  langList,
  encodings
};