import commands from "./commands";
import fsOperation from "../fileSystem/fsOperation";
import Url from "../utils/Url";
import EditorFile from "./editorFile";
import defaultFormatter from "../settings/defaultFormatter";
import dialogs from "../components/dialogs";
import FileBrowser from "../pages/fileBrowser/fileBrowser";
import helpers from "../utils/helpers";
import projects from "./projects";
import selectionMenu from "./selectionMenu";

export default class Acode {
  #fileHandlers = [];
  #modules = {};
  #pluginsInit = {};
  #pluginUnmount = {};
  #pluginSettings = {};
  #formatter = [{
    id: 'default',
    name: 'Default',
    exts: ['*'],
    format: async () => {
      const { beautify } = ace.require('ace/ext/beautify')
      const cursorPos = editorManager.editor.getCursorPosition();
      beautify(editorManager.editor.session);
      editorManager.editor.gotoLine(cursorPos.row + 1, cursorPos.column);
    }
  }];

  constructor() {
    this.define('fs', fsOperation);
    this.define('projects', projects);
    this.define('selectionMenu', selectionMenu);
    this.define('alert', dialogs.alert);
    this.define('confirm', dialogs.confirm);
    this.define('prompt', dialogs.prompt);
    this.define('select', dialogs.select);
    this.define('multiPrompt', dialogs.multiPrompt);
    this.define('loader', dialogs.loader);
    this.define('fileBrowser', FileBrowser);
    this.define('toInternalUrl', helpers.toInternalUri);
    this.define('Url', Url);
  }

  define(name, module) {
    this.#modules[name] = module;
  }

  require(module) {
    return this.#modules[module];
  }

  exec(key, val) {
    if (key in commands) {
      return commands[key](val);
    } else {
      return false;
    }
  }

  get exitAppMessage() {
    const numFiles = editorManager.hasUnsavedFiles();
    if (numFiles) {
      return strings['unsaved files close app'];
    }
  }

  setLoadingMessage(message) {
    document.body.setAttribute('data-small-msg', message);
  }

  setPluginInit(id, initFunction, settings) {
    this.#pluginsInit[id] = initFunction;
    this.#pluginSettings[id] = settings;
  }

  getPluginSettings(id) {
    this.#pluginSettings[id];
  }

  setPluginUnmount(id, unmountFunction) {
    this.#pluginUnmount[id] = unmountFunction;
  }
  /**
   * 
   * @param {string} id plugin id
   * @param {string} baseUrl local plugin url
   * @param {HTMLElement} $page 
   */
  initPlugin(id, baseUrl, $page, options) {
    if (id in this.#pluginsInit) {
      this.#pluginsInit[id](baseUrl, $page, options);
    }
  }

  unmountPlugin(id) {
    if (id in this.#pluginUnmount) {
      this.#pluginUnmount[id]();
      fsOperation(Url.join(CACHE_STORAGE, id)).delete();
    }
  }

  registerFormatter(id, extensions, format) {
    this.#formatter.unshift({
      id,
      exts: extensions,
      format,
    });
  }

  unregisterFormatter(id) {
    this.#formatter = this.#formatter.filter((formatter) => formatter.id !== id);
    const { formatter } = appSettings.value;
    Object.keys(formatter).forEach((mode) => {
      if (formatter[mode] === id) {
        delete formatter[mode];
      }
    });
    appSettings.update(false);
  }

  async format(selectIfNull = true) {
    const file = editorManager.activeFile;
    const { getModeForPath } = ace.require('ace/ext/modelist');
    const { name } = getModeForPath(file.filename);
    const formatterId = appSettings.value.formatter[name];
    let formatter = this.#formatter.find(({ id }) => id === formatterId);

    if (!formatter && selectIfNull) {
      defaultFormatter(name);
    } else if (!formatter && !selectIfNull) {
      toast(strings['please select a formatter']);
    }

    if (formatter) await formatter.format();
  }

  fsOperation(file) {
    return fsOperation(file);
  }

  newEditorFile(filename, options) {
    new EditorFile(filename, options);
  }

  get formatters() {
    return this.#formatter.map(({ id, name, exts }) => ({
      id,
      name: name || id,
      exts,
    }));
  }

  /**
   * 
   * @param {string[]} extensions 
   * @returns {Array<[id: String, name: String]>} options
   */
  getFormatterFor(extensions) {
    const options = [[null, strings.none]];
    this.formatters.forEach(({ id, name, exts }) => {
      const supports = exts.some((ext) => extensions.includes(ext));
      if (supports || exts.includes('*')) {
        options.push([id, name]);
      }
    });
    return options;
  }

  alert(title, message, onhide) {
    dialogs.alert(title, message, onhide);
  }

  loader(title, message, cancel) {
    return dialogs.loader.create(title, message, cancel);
  }

  joinUrl(...args) {
    return Url.join(...args);
  }

  addIcon(className, src) {
    let style = document.head.get(`style[icon="${className}"]`);
    if (!style) {
      style = <style icon={className}>{`.icon.${className}{background-image: url(${src})}`}</style>
      document.head.appendChild(style);
    }
  }

  async prompt(message, defaultValue, type, options) {
    const response = await dialogs.prompt(message, defaultValue, type, options);
    return response;
  }

  async confirm(title, message) {
    const confirmation = await dialogs.confirm(title, message);
    return confirmation;
  }

  async select(title, options, config) {
    const response = await dialogs.select(title, options, config);
    return response;
  }

  async multiPrompt(title, inputs, help) {
    const values = await dialogs.multiPrompt(title, inputs, help);
    return values;
  }

  async fileBrowser(mode, info, openLast) {
    const res = await FileBrowser(mode, info, openLast)
    return res;
  }

  async toIneternalUrl(url) {
    url = await helpers.toInternalUri(url);
    return url;
  }
}
