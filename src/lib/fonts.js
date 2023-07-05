import loader from 'dialogs/loader';
import fsOperation from 'fileSystem';
import helpers from 'utils/helpers';
import Url from 'utils/Url';

const fonts = new Map();

add('Fira Code', `@font-face {
  font-family: 'Fira Code';
  src: url(../res/fonts/FiraCode.ttf) format('truetype');
  font-weight: 300 700;
  font-style: normal;
}`);

add('Roboto Mono', `@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(../res/fonts/RobotoMono.ttf) format('truetype');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}`);

add('Source Code', `@font-face {
  font-family: 'Source Code';
  src: url(https://acode.foxdebug.com/SourceCodePro.ttf) format('truetype');
  font-weight: 300 700;
  font-style: normal;
}`);

add('Victor Mono Italic', `@font-face {
  font-family: 'Victor Mono Italic';
  src: url(https://acode.foxdebug.com/VictorMono-Italic.otf) format('truetype');
  font-style: normal;
}`);

add('Victor Mono Medium', `@font-face {
  font-family: 'Victor Mono Medium';
  src: url(https://acode.foxdebug.com/VictorMono-Medium.otf) format('truetype');
  font-weight: medium;
  font-style: normal;
}`);

add('Cascadia Code', `@font-face {
  font-family: 'Cascadia Code';
  src: url(https://acode.foxdebug.com/CascadiaCode.ttf) format('truetype');
  font-weight: 300 700;
  font-style: normal;
}`);

add('Proggy Clean', `@font-face {
  font-family: 'Proggy Clean';
  src: url(https://acode.foxdebug.com/ProggyClean.ttf) format('truetype');
  font-weight: 300 700;
  font-style: normal;
}`);

add('JetBrains Mono Bold', `@font-face {
  font-family: 'JetBrains Mono Bold';
  src: url(https://acode.foxdebug.com/JetBrainsMono-Bold.ttf) format('truetype');
  font-weight: bold;
}`);

add('JetBrains Mono Regular', `@font-face {
  font-family: 'JetBrains Mono Regular';
  src: url(https://acode.foxdebug.com/JetBrainsMono-Regular.ttf) format('truetype');
  font-weight: 300 700;
  font-style: normal;
}`);

add('Poppins', `@font-face {
  font-display: swap;
  font-family: Poppins;
  font-style: normal;
  font-weight: 400;
  src: url(https://acode.foxdebug.com/Poppins-Regular.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`);

add('Righteous', `@font-face {
  font-family: Righteous;
  font-style: normal;
  font-weight: 400;
  src: url(https://acode.foxdebug.com/righteous-latin-regular.woff) format('woff');
}`);

add('Noto Mono', `@font-face {
  font-display: swap;
  font-family: 'Noto Mono';
  src: url(https://acode.foxdebug.com/NotoMono-Regular.woff) format("woff");
  font-weight: 400;
  font-style: normal;
  unicode-range: U+0590-06FF;
}`);

function add(name, css) {
  fonts.set(name, css);
}

function get(name) {
  return fonts.get(name);
}

function getNames() {
  return [...fonts.keys()];
}

async function setFont(name) {
  loader.showTitleLoader();
  try {
    const $style = tag.get('style#font-style') ?? <style id="font-style"></style>;
    let css = get(name);

    // get all url font css
    const urls = /url\((.*?)\)/g.exec(css)?.slice(1);

    await Promise.all(urls?.map(async url => {
      if (!/^https?/.test(url)) return;
      if (/^https?:\/\/localhost/) return;
      const fontFile = await downloadFont(name, url);
      const internalUrl = await helpers.toInternalUri(fontFile);
      css = css.replace(url, internalUrl);
    }));


    $style.textContent = `${css}
  .editor-container.ace_editor{
    font-family: "${name}", NotoMono, Monaco, MONOSPACE !important;
  }
  .ace_text{
    font-family: inherit !important;
  }`;
    document.head.append($style);
  } catch (error) {
    toast(`${name} font not found`, 'error');
    setFont('Roboto Mono');
  } finally {
    loader.removeTitleLoader();
  }
}

async function downloadFont(name, link) {
  const FONT_DIR = Url.join(DATA_STORAGE, 'fonts');
  const FONT_FILE = Url.join(FONT_DIR, name);

  const fs = fsOperation(FONT_FILE);
  if (await fs.exists()) return FONT_FILE;

  if (!await fsOperation(FONT_DIR).exists()) {
    await fsOperation(DATA_STORAGE).createDirectory('fonts');
  }

  const font = await fsOperation(link).readFile();
  await fsOperation(FONT_DIR).createFile(name, font);

  return FONT_FILE;
}

export default {
  add,
  get,
  getNames,
  setFont,
};
