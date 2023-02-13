import constants from './constants';
import fsOperation from '../fileSystem/fsOperation';
import helpers from '../utils/helpers';
import Url from '../utils/Url';
import lang from './lang';
/**
 * @typedef {object} fileBrowserSettings
 * @property {string} showHiddenFiles
 * @property {string} sortByName
 */

/**
 * @typedef {object} searchAndFindSettings
 * @property {boolean} wrap
 * @property {boolean} caseSensitive
 * @property {boolean} regExp
 */

/**
 * @typedef {object} settingsValue
 * @property {fileBrowserSettings} fileBrowser
 * @property {number} maxFileSize
 * @property {searchAndFindSettings} search
 * @property {string} lang
 */

class Settings {
  /**
   * @type {settingsValue}
   */
  #defaultSettings;
  #oldSettings;
  #initialized = false;
  #on = {
    update: [],
    reset: [],
  };
  #searchSettings = {
    caseSensitive: false,
    regExp: false,
    wholeWord: false,
  };
  #fileBrowserSettings = {
    showHiddenFiles: false,
    sortByName: true,
  };

  QUICKTOOLS_TRIGGER_MODE_TOUCH = 'touch';
  QUICKTOOLS_TRIGGER_MODE_CLICK = 'click';
  OPEN_FILE_LIST_POS_HEADER = 'header';
  OPEN_FILE_LIST_POS_SIDEBAR = 'sidebar';
  KEYBOARD_MODE_NO_SUGGESTIONS = 'NO_SUGGESTIONS';
  KEYBOARD_MODE_NO_SUGGESTIONS_AGGRESSIVE = 'NO_SUGGESTIONS_AGGRESSIVE';
  KEYBOARD_MODE_NORMAL = 'NORMAL';
  CONSOLE_ERUDA = 'eruda';
  CONSOLE_LEGACY = 'legacy';
  PREVIEW_MODE_INAPP = 'inapp';
  PREVIEW_MODE_BROWSER = 'browser';

  customTheme = {
    '--accent-color': 'rgb(51,153,255)',
    '--active-icon-color': 'rgba(0, 0, 0, 0.2)',
    '--border-color': 'rgba(122, 122, 122, 0.227)',
    '--box-shadow-color': 'rgba(0, 0, 0, 0.2)',
    '--button-active-color': 'rgb(44,142,240)',
    '--button-background-color': 'rgb(51,153,255)',
    '--button-text-color': 'rgb(255,255,255)',
    '--error-text-color': 'rgb(255,185,92)',
    '--link-text-color': 'rgb(97,94,253)',
    '--popup-active-color': 'rgb(169,0,0)',
    '--popup-background-color': 'rgb(255,255,255)',
    '--popup-border-color': 'rgba(0, 0, 0, 0)',
    '--popup-icon-color': 'rgb(153,153,255)',
    '--popup-text-color': 'rgb(37,37,37)',
    '--primary-color': 'rgb(153,153,255)',
    '--primary-text-color': 'rgb(255,255,255)',
    '--scrollbar-color': 'rgba(0, 0, 0, 0.33)',
    '--secondary-color': 'rgb(255,255,255)',
    '--secondary-text-color': 'rgb(37,37,37)',
  };

  constructor() {
    this.#defaultSettings = {
      animation: 'system',
      appTheme: 'dark',
      autosave: 0,
      fileBrowser: this.#fileBrowserSettings,
      formatter: {},
      maxFileSize: 12,
      serverPort: constants.SERVER_PORT,
      previewPort: constants.PREVIEW_PORT,
      showConsoleToggler: true,
      previewMode: this.PREVIEW_MODE_INAPP,
      disableCache: false,
      host: 'localhost',
      search: this.#searchSettings,
      lang: 'en-us',
      fontSize: '12px',
      editorTheme: 'ace/theme/nord_dark',
      textWrap: true,
      softTab: true,
      tabSize: 2,
      retryRemoteFsAfterFail: true,
      linenumbers: true,
      formatOnSave: false,
      autoCorrect: true,
      openFileListPos: this.OPEN_FILE_LIST_POS_HEADER,
      quickTools: 1,
      quickToolsTriggerMode: this.QUICKTOOLS_TRIGGER_MODE_TOUCH,
      editorFont: 'Roboto Mono',
      vibrateOnTap: true,
      fullscreen: false,
      floatingButton: true,
      liveAutoCompletion: true,
      showPrintMargin: false,
      printMargin: 80,
      scrollbarSize: 20,
      showSpaces: false,
      confirmOnExit: true,
      customThemeMode: 'dark',
      lineHeight: 2,
      leftMargin: 50,
      checkFiles: true,
      desktopMode: false,
      console: this.CONSOLE_LEGACY,
      keyboardMode: this.KEYBOARD_MODE_NORMAL,
      rememberFiles: true,
      rememberFolders: true,
      diagonalScrolling: false,
      reverseScrolling: false,
      teardropTimeout: 3000,
      teardropSize: 30,
      scrollSpeed: constants.SCROLL_SPEED_NORMAL,
      customTheme: this.customTheme,
      relativeLineNumbers: false,
      elasticTabstops: false,
      rtlText: false,
      hardWrap: false,
      useTextareaForIME: false,
      touchMoveThreshold: Math.round((1 / devicePixelRatio) * 10) / 10,
    };
    this.value = { ...this.#defaultSettings };
  }

  async init() {
    if (this.#initialized) return;
    this.settingsFile = Url.join(DATA_STORAGE, 'settings.json');

    if (!IS_FREE_VERSION) {
      this.#defaultSettings.appTheme = 'ocean';
      this.#defaultSettings.editorTheme = 'ace/theme/dracula';
    }

    this.#initialized = true;

    const fs = fsOperation(this.settingsFile);

    if (!(await fs.exists())) {
      await this.#save();
      this.value = { ...this.#defaultSettings };
      this.#oldSettings = { ...this.#defaultSettings };
      this.value.lang = navigator.language || 'en-us';
      return;
    }

    const settings = helpers.parseJSON(await fs.readFile('utf-8'));
    if (settings) {
      // make sure that all the settings are present
      Object.keys(this.#defaultSettings).forEach((setting) => {
        const value = settings[setting];
        if (value === undefined || typeof value !== typeof this.#defaultSettings[setting]) {
          settings[setting] = this.#defaultSettings[setting];
        }
      });

      this.value = { ...settings };
      this.#oldSettings = { ...settings };
      return;
    }

    await this.reset();
  }

  async #save() {
    const fs = fsOperation(this.settingsFile);
    const settingsText = JSON.stringify(this.value, undefined, 4);

    if (!(await fs.exists())) {
      const dirFs = fsOperation(DATA_STORAGE);
      await dirFs.createFile('settings.json');
    }

    await fs.writeFile(settingsText);
    this.#oldSettings = { ...this.value };
  }

  /**
   *
   * @param {Object} [settings] - if provided, the settings will be updated
   * @param {Boolean} [showToast] - if false, the toast will not be shown
   * default is true
   * @param {Boolean} [saveFile] - if false, the settings will not be saved to the file,
   * default is true
   */
  async update(settings, showToast = true, saveFile = true) {
    if (typeof settings === 'boolean') {
      showToast = settings;
      settings = undefined;
    }

    const onupdate = [...this.#on.update];

    if (settings) {
      Object.keys(settings).forEach((key) => {
        if (key in this.value) this.value[key] = settings[key];
      });
    }

    const changedSettings = this.#getChangedKeys();
    changedSettings.forEach((setting) => {
      this.#applySettings(setting);
      const listeners = this.#on[`update:${setting}`];
      if (Array.isArray(listeners)) {
        onupdate.push(...listeners);
      }
      onupdate.forEach((listener) => listener(this.value[setting]));
    });

    if (saveFile) await this.#save();
    if (showToast) toast(strings['settings saved']);
  }

  async reset(setting) {
    if (setting) {
      if (setting in this.#defaultSettings) {
        this.value[setting] = this.#defaultSettings[setting];
        await this.update();
      } else {
        return false;
      }
    } else {
      this.value = this.#defaultSettings;
      await this.update(false);
    }

    this.#on.reset.forEach((onreset) => onreset(this.value))
  }

  /**
   *
   * @param {'update' | 'reset'} event
   * @param {function():void} callback
   */
  on(event, callback) {
    if (!this.#on[event]) this.#on[event] = [];
    this.#on[event].push(callback);
  }

  /**
   *
   * @param {'update' | 'reset'} event
   * @param {function():void} callback
   */
  off(event, callback) {
    if (!this.#on[event]) this.#on[event] = [];
    this.#on[event].splice(this.#on[event].indexOf(callback), 1);
  }

  /**
   *
   * @param {String} key
   * @returns
   */
  get(key) {
    return this.value[key];
  }

  /**
   * Returns changed settings
   * @returns {Array<String>}
   */
  #getChangedKeys() {
    if (!this.#oldSettings) return [];
    const keys = [];
    Object.keys(this.#oldSettings).forEach((key) => {
      const value = this.#oldSettings[key];
      if (typeof value === 'object') {
        if (!helpers.areEqual(value, this.value[key])) keys.push(key);
        return;
      }

      if (value !== this.value[key]) keys.push(key);
    });
    return keys;
  }

  #applySettings(setting) {
    switch (setting) {
      case 'animation':
        this.applyAnimationSetting();
        break;

      case 'lang':
        this.applyLangSetting();
        break;

      default:
        break;
    }
  }

  async applyAnimationSetting() {
    let value = this.value.animation;
    if (value === 'system') {
      const res = await new Promise((resolve, reject) => {
        system.getGlobalSetting("animator_duration_scale", resolve, reject);
      });
      if (res) value = 'yes';
      else value = 'no';
    }

    if (value === 'yes') {
      app.classList.remove('no-animation');
    } else if (value === 'no') {
      app.classList.add('no-animation');
    }
  }

  async applyLangSetting() {
    const value = this.value.lang;
    lang.set(value);
  }
}

export default new Settings();
