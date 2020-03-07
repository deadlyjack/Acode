const FILE_NAME_REGEX = /^((?![:<>"\/\\\|\?\*]).)*$/;
const FONT_SIZE = /^[0-9]{1,2}(px|em|pt|mm|pc|in)$/;
const HEX_COLOR = /^#([a-f0-9]{3}){1,2}([a-f0-9]{2})?$/i;
const RGB_COLOR = /^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(\s*,\s*\d?(\.\d+)?)?\)$/i;
const HSL_COLOR = /^hsla?\(([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(\s*,\s*\d?(\.\d+)?)?\)$/i;
const DEFAULT_SESSION = "default-session";
const RATING_TIME = 5;
const CONSOLE_PORT = 8159;
const PORT = 8158;
// const encodings = {
//   "unicode": ["utf-16be", "utf-16", "utf-8"],
//   "window": ["win874", ...pattern("win125$1", 8, 0)],
//   "ISO": pattern("iso-8859-$1", 16),
//   "Mac": ["maccroatian", "maccyrillic", "macgreek", "maciceland", "macroman", "macromania", "macthai", "macturkish", "macukraine", "maccenteuro", "macintosh"],
//   "KOI8": ["koi8-r", "koi8-u", "koi8-ru", "koi8-t"],
//   "Miscellaneous": ["armscii8", "rk1048", "tcvn", "georgianacademy", "georgianps", "pt154", "viscii", "iso646cn", "iso646jp", "hproman8", "tis620"],
//   "Japanese": ["Shift_JIS", "Windows-31j", "Windows932", "EUC-JP"],
//   "Chinese": ["GB2312", "GBK", "GB18030", "Windows936", "EUC-CN"],
//   "Korean": ["KS_C_5601", "Windows949", "EUC-KR"],
//   "Taiwan/Hong Kong": ["Big5", "Big5-HKSCS", "Windows950"]
// };
const encodings = ["big5", "euc-jp", "euc-kr", "gb18030", "hz-gb-2312", "ibm866", "iso-2022-jp", "iso-8859-10", "iso-8859-13", "iso-8859-14", "iso-8859-15", "iso-8859-16", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6", "iso-8859-7", "iso-8859-8", "iso-8859-8-i", "koi8-r", "koi8-u", "macintosh", "shift_jis", "utf-16be", "utf-16le", "utf-8", "windows-1250", "windows-1251", "windows-1252", "windows-1253", "windows-1254", "windows-1255", "windows-1256", "windows-1257", "windows-1258", "windows-874", "x-mac-cyrillic"];
const langList = {
  'hi-in': 'हिंदी',
  'en-us': 'English',
  'id-id': 'Indonesian',
  'ru-ru': 'Русский',
  'pt-br': 'Português',
  'uk-ua': 'Українська',
  'zh-cn': '中文简体',
  'ir-fa': 'فارسی',
};
const themeList = ["ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt", "crimson_editor", "dawn", "dracula", "dreamweaver", "eclipse", "github", "gob", "gruvbox", "idle_fingers", "iplastic", "katzenmilch", "kr_theme", "kuroir", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "sqlserver", "terminal", "textmate", "tomorrow", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink", "xcode"];

function pattern(string, int, start) {
  const ar = [];
  for (let i = start !== undefined ? start : 1; i <= int; ++i) {
    ar.push(string.replace('$1', i));
  }
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
  themeList,
  langList,
  encodings
};