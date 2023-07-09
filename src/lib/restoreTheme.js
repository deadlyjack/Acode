import themes from './themes';
import appSettings from './settings';
import Color from 'utils/color';

let busy = false;
let lastCall;

/**
 * Restores the theme or darkens the status bar and navigation bar
 * Used when dialogs are opened which has mask that darkens the background
 * @param {boolean} darken Whether to darken the status bar and navigation bar
 * @returns 
 */
export default function restoreTheme(darken) {
  if (busy) {
    lastCall = darken;
    return;
  }
  if (darken && document.body.classList.contains('loading')) return;

  let themeName = DOES_SUPPORT_THEME ? appSettings.value.appTheme : 'default';
  let theme = themes.get(themeName);

  if (theme?.version !== 'free' && IS_FREE_VERSION) {
    themeName = 'default';
    theme = themes.get(themeName);
    appSettings.value.appTheme = themeName;
    appSettings.update();
  }

  busy = true;
  if (!theme.darkenedPrimaryColor ||
    theme.darkenedPrimaryColor === theme.primaryColor) {
    theme.darkenPrimaryColor();
  }
  const color = darken ? theme.darkenedPrimaryColor : theme.primaryColor;
  const hexColor = Color(color).hex.toString();
  system.setUiTheme(hexColor, theme.type, () => {
    busy = false;
    if (lastCall !== undefined) {
      restoreTheme(lastCall);
      lastCall = undefined;
    }
  }, (error) => {
    console.error(error);
  });
}
