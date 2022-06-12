import fsOperation from './fileSystem/fsOperation';
import helpers from './utils/helpers';
import Url from './utils/Url';
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
 * @property {string[]} filesNotAllowed
 * @property {searchAndFindSettings} search
 * @property {string} lang
 */

class Settings {
  /**
   * @type {settingsValue}
   */
  #defaultSettings;
  #initialized = false;
  #oldSettings;
  #keyboardModes = ['NO_SUGGESTIONS', 'NO_SUGGESTIONS_AGGRESSIVE', 'NORMAL'];

  constructor() {
    this.methods = {
      update: [],
      reset: [],
    };

    this.#defaultSettings = {
      animation: true,
      appTheme: /free/.test(BuildInfo.packageName) ? 'dark' : 'ocean',
      autosave: 0,
      fileBrowser: {
        showHiddenFiles: false,
        sortByName: true,
      },
      maxFileSize: 12,
      filesNotAllowed: [
        'zip',
        'apk',
        'doc',
        'docx',
        'mp3',
        'mp4',
        'avi',
        'flac',
        'mov',
        'rar',
        'pdf',
        'gif',
        'flv',
      ],
      search: {
        caseSensitive: false,
        regExp: false,
        wholeWord: false,
        backwards: true,
      },
      lang: 'en-us',
      fontSize: '12px',
      editorTheme: /free/.test(BuildInfo.packageName)
        ? 'ace/theme/nord_dark'
        : 'ace/theme/dracula',
      textWrap: true,
      softTab: true,
      tabSize: 2,
      linenumbers: true,
      beautify: ['*'],
      linting: false,
      autoCorrect: true,
      previewMode: 'inapp',
      openFileListPos: 'header',
      quickTools: true,
      editorFont: 'default',
      vibrateOnTap: true,
      fullscreen: false,
      floatingButtonActivation: 'click',
      floatingButton: true,
      liveAutoCompletion: true,
      showPrintMargin: false,
      scrollbarSize: 20,
      showSpaces: false,
      // showAd: true,
      cursorControllerSize: 'small',
      confirmOnExit: true,
      customThemeMode: 'dark',
      lineHeight: 2,
      leftMargin: 50,
      checkFiles: true,
      desktopMode: false,
      console: 'legacy',
      keyboardMode: 'NO_SUGGESTIONS',
      hideTearDropTimeOut: 3000,
      disableCache: false,
      rememberFiles: true,
      rememberFolders: true,
      customTheme: {
        '--primary-color': 'rgb(153,153,255)',
        '--secondary-color': 'rgb(255,255,255)',
        '--accent-color': 'rgb(51,153,255)',
        '--text-color': 'rgb(37,37,37)',
        '--text-main-color': 'rgb(255,255,255)',
        '--a-color': 'rgb(97,94,253)',
        '--border-color': 'rgba(122, 122, 122, 0.227)',
        '--error-text-color': 'rgb(255,185,92)',
        '--active-icon-color': 'rgba(0, 0, 0, 0.2)',
        '--popup-border-color': 'rgba(0, 0, 0, 0)',
        '--box-shadow-color': 'rgba(0, 0, 0, 0.2)',
        '--button-background-color': 'rgb(51,153,255)',
        '--button-active-color': 'rgb(44,142,240)',
        '--button-text-color': 'rgb(255,255,255)',
        '--scrollbar-color': 'rgba(0, 0, 0, 0.33)',
        '--menu-background-color': 'rgb(255,255,255)',
        '--menu-text-color': 'rgb(37,37,37)',
        '--menu-icon-color': 'rgb(153,153,255)',
        '--dialogbox-background-color': 'rgb(255,255,255)',
        '--dialogbox-text-color': 'rgb(37,37,37)',
        '--dialogbox-selected-option-color': 'rgb(169,0,0)',
        '--command-palette-background-color': 'rgb(153,153,255)',
        '--command-palette-text-color': 'rgb(255,255,255)',
        '--command-palette-border': 'none',
      },
    };

    this.settingsFile = Url.join(DATA_STORAGE, 'settings.json');
  }

  async init(lang) {
    if (this.#initialized) return;
    this.#initialized = true;

    const fs = fsOperation(this.settingsFile);

    if (!(await fs.exists())) {
      await this.#save();
      this.value = { ...this.#defaultSettings };
      this.#oldSettings = { ...this.#defaultSettings };
      this.value.lang = lang;
      return;
    }

    const settings = helpers.parseJSON(await fs.readFile('utf-8'));
    if (settings) {
      if (!Array.isArray(settings.beautify)) savedSettings.beautify = ['*'];
      for (let setting in this.#defaultSettings) {
        if (!(setting in settings)) {
          settings[setting] = this.#defaultSettings[setting];
        }

        if (setting === 'keyboardMode') {
          if (!this.#keyboardModes.includes(settings[setting])) {
            settings[setting] = this.#defaultSettings[setting];
          }
        }
      }
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
   * @param {Object} settings
   * @param {Boolean} showToast
   * @param {Boolean} saveFile
   */
  async update(settings = null, showToast = true, saveFile = true) {
    if (typeof settings === 'boolean') {
      showToast = settings;
      settings = null;
    }

    const onupdate = [...this.methods.update];

    for (let key in settings) {
      if (key in this.value) this.value[key] = settings[key];
    }

    const changedSettings = this.#getChangedKeys();
    for (let key of changedSettings) {
      if (Array.isArray(this.methods[`update:${key}`])) {
        for (let cb of this.methods[`update:${key}`]) {
          onupdate.push(cb.bind(this.value, this.value[key]));
        }
      }
    }

    if (saveFile) await this.#save();
    if (showToast) toast(strings['settings saved']);
    for (let callback of onupdate) callback(this.value);
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

    for (let onreset of this.methods.reset) onreset(this.value);
  }

  /**
   *
   * @param {'update' | 'reset'} event
   * @param {function():void} callback
   */
  on(event, callback) {
    if (!this.methods[event]) this.methods[event] = [];
    this.methods[event].push(callback);
  }

  /**
   *
   * @param {'update' | 'reset'} event
   * @param {function():void} callback
   */
  off(event, callback) {
    if (!this.methods[event]) this.methods[event] = [];
    this.methods[event].splice(this.methods[event].indexOf(callback), 1);
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
   *
   * @param {String} ext
   * @returns
   */
  isFileAllowed(ext = '') {
    return this.value.filesNotAllowed.includes(ext.toLowerCase());
  }

  /**
   * Returns changed settings
   * @returns {Array<String>}
   */
  #getChangedKeys() {
    const keys = [];
    for (let key in this.#oldSettings) {
      const value = this.#oldSettings[key];
      if (typeof value === 'object') {
        if (!helpers.areEqual(value, this.value[key])) keys.push(key);
        continue;
      }

      if (value !== this.value[key]) keys.push(key);
    }
    return keys;
  }
}

export default Settings;
