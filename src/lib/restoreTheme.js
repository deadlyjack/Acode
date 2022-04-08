import Irid from 'irid';
import constants from './constants';
import fsOperation from './fileSystem/fsOperation';
import Url from './utils/Url';

export default async function restoreTheme(darken) {
  if (darken && document.body.classList.contains('loading')) return;

  let theme = DOES_SUPPORT_THEME ? appSettings.value.appTheme : 'default';
  const themeList = constants.appThemeList;
  let themeData = themeList[theme];
  let type = themeData.type;

  if (!themeData || (!themeData.isFree && IS_FREE_VERSION)) {
    theme = 'default';
    themeData = themeList[theme];
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
  system.setUiTheme(hexColor, type);

  if (DOES_SUPPORT_THEME) {
    document.body.setAttribute('theme-type', type);
    const style = getComputedStyle(app);
    const loaderFile = Url.join(ASSETS_DIRECTORY, 'res/tail-spin.svg');
    const textColor = style.getPropertyValue('--text-main-color').trim();
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
      app.style.cssText = `--tail-spin: url(${img})`;
    } catch (error) {
      console.error(error);
    }
  }
}
