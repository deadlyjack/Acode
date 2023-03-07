import fonts from './fonts';
import { themes } from './preLoadedThemes';
import restoreTheme from './restoreTheme';
import settings from './settings';
import ThemeBuilder from './themeBuilder';

/** @type {Map<string, ThemeBuilder>} */
const appThemes = new Map();

themes.forEach((theme) => add(theme));

function list() {
  return [...appThemes.keys()].map((name) => {
    const { type, primaryColor, version } = appThemes.get(name);
    return {
      name,
      type,
      version,
      primaryColor,
    }
  });
}

/**
 * 
 * @param {string} name 
 * @returns {ThemeBuilder}
 */
function get(name) {
  return appThemes.get(name.toLowerCase());
}

/**
 * 
 * @param {ThemeBuilder} theme 
 * @returns 
 */
function add(theme) {
  if (!(theme instanceof ThemeBuilder)) return;
  appThemes.set(theme.name.toLowerCase(), theme);
}

/**
 * Apply a theme
 * @param {string} name The name of the theme to apply
 * @param {boolean} init Whether or not this is the first time the theme is being applied
 */
function apply(name, init) {
  const theme = get(name);
  const $style = document.head.get('style#app-theme') ?? <style id="app-theme"></style>;
  const update = {
    appTheme: name,
  };

  if (name === 'custom') {
    update.customTheme = theme.toJSON();
  }

  if (init && theme.preferredEditorTheme) {
    update.editorTheme = theme.preferredEditorTheme;
    editorManager.editor.setTheme(theme.preferredEditorTheme);
  }

  if (init && theme.preferredFont) {
    update.editorFont = theme.preferredFont;
    fonts.setFont(theme.preferredFont);
  }

  settings.update(update, false);
  localStorage.__primary_color = theme.primaryColor;
  document.body.setAttribute('theme-type', theme.type);
  $style.textContent = theme.css;
  document.head.append($style);
  restoreTheme();
}

/**
 * Update a theme
 * @param {ThemeBuilder} theme 
 */
function update(theme) {
  if (!(theme instanceof ThemeBuilder)) return;
  const json = theme.toJSON();
  const oldTheme = get(theme.name);
  if (!oldTheme) return;
  Object.keys(json).forEach((key) => {
    oldTheme[key] = json[key];
  });
}

export default {
  list,
  get,
  add,
  apply,
  update,
}
