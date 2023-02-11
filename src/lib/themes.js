const editorThemes = {
  ambiance: scheme('ambiance', 'dark'),
  chaos: scheme('chaos', 'dark'),
  chrome: scheme('chrome', 'light'),
  cloud9_day: scheme('cloud9 day', 'light'),
  cloud9_night: scheme('cloud9 night', 'dark'),
  cloud9_night_low_color: scheme('cloud9 night low color', 'dark'),
  clouds: scheme('clouds', 'light'),
  clouds_midnight: scheme('clouds midnight', 'dark'),
  cobalt: scheme('cobalt', 'dark'),
  crimson_editor: scheme('crimson editor', 'light'),
  dawn: scheme('dawn', 'light'),
  dracula: scheme('dracula', 'dark'),
  dracula_pro: scheme('dracula_pro','dark'),
  dreamweaver: scheme('dreamweaver', 'light'),
  eclipse: scheme('eclipse', 'light'),
  github: scheme('github', 'light'),
  github_dark: scheme('github_dark', 'dark'),
  gob: scheme('gob', 'dark'),
  gruvbox: scheme('gruvbox', 'dark'),
  gruvbox_dark_hard: scheme('gruvbox dark hard', 'dark'),
  gruvbox_light_hard: scheme('gruvbox light hard', 'light'),
  idle_fingers: scheme('idle_fingers', 'dark'),
  iplastic: scheme('iplastic', 'light'),
  katzenmilch: scheme('katzenmilch', 'light'),
  kr_theme: scheme('kr_theme', 'dark'),
  kuroir: scheme('kuroir', 'light'),
  merbivore: scheme('merbivore', 'dark'),
  merbivore_soft: scheme('merbivore_soft', 'dark'),
  mono_industrial: scheme('mono_industrial', 'dark'),
  monokai: scheme('monokai', 'dark'),
  nord_dark: scheme('nord_dark', 'dark'),
  one_dark: scheme('one_dark', 'dark'),
  one_dark_pro: scheme('one_dark_pro', 'dark'),
  pastel_on_dark: scheme('pastel_on_dark', 'dark'),
  solarized_dark: scheme('solarized_dark', 'dark'),
  solarized_light: scheme('solarized_light', 'light'),
  sqlserver: scheme('sqlserver', 'light'),
  terminal: scheme('terminal', 'dark'),
  textmate: scheme('textmate', 'light'),
  tomorrow: scheme('tomorrow', 'light'),
  tomorrow_night: scheme('tomorrow_night', 'dark'),
  tomorrow_night_blue: scheme('tomorrow_night_blue', 'dark'),
  tomorrow_night_bright: scheme('tomorrow_night_bright', 'dark'),
  tomorrow_night_eighties: scheme('tomorrow_night_eighties', 'dark'),
  twilight: scheme('twilight', 'dark'),
  vibrant_ink: scheme('vibrant_ink', 'dark'),
  vscode_default: scheme('vscode_default','dark'),
  xcode: scheme('xcode', 'light'),
};

const appThemes = {
  custom: scheme('custom', 'dark', false),
  atticus: scheme('atticus', 'dark', false, '#201e1e', '#363333'),
  bump: scheme('bump', 'dark', false, '#1c2126', '#303841'),
  bling: scheme('bling', 'dark', false, '#131326', '#202040'),
  black: scheme('black', 'dark', false, '#000000', '#000000'),
  dark: scheme('dark', 'dark', true, '#1d1d1d', '#313131'),
  moon: scheme('moon', 'dark', false, '#14181d', '#222831'),
  ocean: scheme('ocean', 'dark', false, '#13131a', '#20202c'),
  tomyris: scheme('tomyris', 'dark', false, '#230528', '#3b0944'),
  menes: scheme('menes', 'dark', false, '#1f2226', '#353941'),
  default: scheme('default', 'dark', true, '#5c5c99', '#9999ff'),
  light: scheme('light', 'light', false, '#999999', '#ffffff'),
};

/**
 *
 * @param {string} type
 * @param {"light"|"dark"} type
 * @param {boolean} [isFree]
 * @param {string} [darken]  primary color darkened by 40%
 * @param {string} [primary]
 * @returns {ThemeData}
 */
function scheme(name, type, isFree, darken, primary) {
  if (typeof isFree === undefined) {
    return {
      name,
      type,
    };
  }

  return {
    name,
    type,
    isFree,
    darken,
    primary,
  };
}

export default {
  editorThemes,
  appThemes,
}
