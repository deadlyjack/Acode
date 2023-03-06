import fsOperation from '../fileSystem';
import Url from '../utils/Url';
import themes from './themes';
import appSettings from './settings';
import { Irid } from 'irid';

let busy = false;
let lastCall;

export default async function restoreTheme(darken) {
  if (busy) {
    lastCall = darken;
    return;
  }
  if (darken && document.body.classList.contains('loading')) return;

  let themeName = DOES_SUPPORT_THEME ? appSettings.value.appTheme : 'default';
  let theme = themes.get(themeName);

  if (!theme || (theme.version !== 'free' && IS_FREE_VERSION)) {
    themeName = 'default';
    theme = themes.get(themeName);
    appSettings.value.appTheme = themeName;
    appSettings.update();
  }

  busy = true;
  const hexColor = Irid(darken ? theme.darkenedPrimaryColor : theme.primaryColor).toHexString();
  system.setUiTheme(hexColor, theme.type, () => {
    busy = false;
    if (lastCall !== undefined) {
      restoreTheme(lastCall);
      lastCall = undefined;
    }
  }, (error) => {
    console.error(error);
  });

  if (DOES_SUPPORT_THEME) {
    const loaderFile = Url.join(ASSETS_DIRECTORY, 'res/tail-spin.svg');
    const svgName = '__tail-spin__.svg';
    const img = Url.join(DATA_STORAGE, svgName);

    try {
      let fs = fsOperation(loaderFile);
      const svg = await fs.readFile('utf-8');

      fs = fsOperation(img);
      if (!(await fs.exists())) {
        await fsOperation(DATA_STORAGE).createFile(svgName);
      }
      await fs.writeFile(
        svg.replace(/#fff/g, theme.primaryColor),
      );
    } catch (error) {
      console.error(error);
    }
  }
}
