import Irid from 'irid';
import fsOperation from '../fileSystem/fsOperation';
import Url from '../utils/Url';
import themes from './themes';
import appSettings from './settings';

let busy = false;
let lastCall;

export default async function restoreTheme(darken) {
  if (busy) {
    lastCall = darken;
    return;
  }
  if (darken && document.body.classList.contains('loading')) return;

  let theme = DOES_SUPPORT_THEME ? appSettings.value.appTheme : 'default';
  const { appThemes } = themes;
  let themeData = appThemes[theme];
  let type = themeData.type;

  if (!themeData || (!themeData.isFree && IS_FREE_VERSION)) {
    theme = 'default';
    themeData = appThemes[theme];
    appSettings.value.appTheme = theme;
    appSettings.update();
  }

  if (theme === 'custom') {
    const color = appSettings.value.customTheme['--primary-color'];
    themeData.primary = Irid(color).toHexString();
    themeData.darken = Irid(themeData.primary).darken(0.4).toHexString();

    type = appSettings.value.customThemeMode;
  }

  let hexColor = darken ? themeData.darken : themeData.primary;

  app.setAttribute('theme', theme);
  busy = true;
  system.setUiTheme(hexColor, type, () => {
    busy = false;
    if (lastCall !== undefined) {
      restoreTheme(lastCall);
      lastCall = undefined;
    }
  }, (error) => {
    console.error(error);
  });

  if (DOES_SUPPORT_THEME) {
    document.body.setAttribute('theme-type', type);
    const style = getComputedStyle(app);
    const loaderFile = Url.join(ASSETS_DIRECTORY, 'res/tail-spin.svg');
    const textColor = style.getPropertyValue('--primary-text-color').trim();
    const svgName = '__tail-spin__.svg';
    const img = Url.join(DATA_STORAGE, svgName);

    const color = style.getPropertyValue('--primary-color').trim();
    localStorage.__primary_color = color;
    try {
      let fs = fsOperation(loaderFile);
      const svg = await fs.readFile('utf-8');

      fs = fsOperation(img);
      if (!(await fs.exists())) {
        await fsOperation(DATA_STORAGE).createFile(svgName);
      }
      const text = svg.replace(/#fff/g, textColor);
      await fs.writeFile(text);
    } catch (error) {
      console.error(error);
    }
  }
}
