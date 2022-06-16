import commands from "./commands";

export default class Acode {
  #pluginsInit = {};
  #pluginUnmount = {};
  #formatter = [{
    id: 'default',
    extenstions: ['*'],
    format: async () => {
      const { beautify } = ace.require('ace/ext/beautify')
      beautify(editorManager.editor.session);
    }
  }];

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
  setPluginInit(id, initFunction) {
    console.log('initPlugin', id);
    this.#pluginsInit[id] = initFunction;
  }
  setPluginUnmount(id, unmountFunction) {
    console.log('unmountPlugin', id);
    this.#pluginUnmount[id] = unmountFunction;
  }
  /**
   * 
   * @param {string} id plugin id
   * @param {string} baseUrl local plugin url
   * @param {HTMLElement} $page 
   */
  initPlugin(id, baseUrl, $page) {
    if (id in this.#pluginsInit) {
      this.#pluginsInit[id](baseUrl, $page);
    }
  }
  unmountPlugin(id) {
    if (id in this.#pluginUnmount) {
      this.#pluginUnmount[id]();
    }
  }
  registerFormatter(id, extensions, formatter) {
    this.#formatter.unshift({
      id,
      extensions,
      formatter,
    });
  }
  async format() {
    const file = editorManager.activeFile;
    const formatter = this.#formatter.find((f) => f.extenstions.includes(file.extension || '*'));
    if (formatter) {
      await formatter.format();
    }
  }
}