import themes from './themes';
import appSettings from './settings';
import { Irid } from 'irid';

let busy = false;
let lastCall;

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
  const hexColor = Irid(
    darken ? theme.darkenedPrimaryColor : theme.primaryColor,
  ).toHexString();
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
