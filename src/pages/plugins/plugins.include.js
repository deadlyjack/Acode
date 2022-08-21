import ajax from "@deadlyjack/ajax";
import mustache from 'mustache'
import tag from "html-tag-js";
import template from './plugins.hbs';
import list from './list.hbs';
import Page from "../../components/page";
import helpers from "../../utils/helpers";
import searchBar from "../../components/searchbar";
import fsOperation from "../../fileSystem/fsOperation";
import Url from "../../utils/Url";
import plugin from "../plugin/plugin";

/**
 * 
 * @param {Array<PluginJson>} updates 
 */
export default function PluginsInclude(updates) {
  const LOADING = 0;
  const LOADED = 1;
  const listJson = 'https://raw.githubusercontent.com/deadlyjack/acode-plugins/main/list.json';
  const $page = Page(strings['plugins']);
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: 'search',
    },
  });
  const plugins = {
    all: [],
    installed: [],
  };
  let section = 'installed';
  let allState = LOADING;
  let installedState = LOADING;

  $page.body.innerHTML = mustache.render(template, {
    msg: strings['loading...'],
  });
  $page.header.append($search);

  actionStack.push({
    id: 'plugins',
    action: $page.hide,
  });

  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('plugins');
    helpers.removeTitleLoader();
  };

  $page.onclick = handleClick;

  app.append($page);
  helpers.showAd();

  if (updates) {
    $page.get('.options').style.display = 'none';
    $page.settitle(strings.update);
    getInstalledPlugins(updates)
      .then(render);
    return;
  }

  getAllPlugins();
  getInstalledPlugins()
    .then(() => {
      render();
    });

  function renderAll() {
    $page.get('[action="select"].active')?.classList.remove('active');
    $page.get('[action="select"][value="all"]')?.classList.add('active');
    $page
      .get('#plugin-list')
      .innerHTML = mustache.render(list, plugins.all);
  }

  function renderInstalled() {
    $page.get('[action="select"].active')?.classList.remove('active');
    $page.get('[action="select"][value="installed"]')?.classList.add('active');
    $page
      .get('#plugin-list')
      .innerHTML = mustache.render(list, plugins.installed);
  }

  function handleClick(event) {
    const $target = event.target;
    const action = $target.getAttribute('action');
    if (action === 'search') {
      searchBar($page.get('#plugins'));
      return;
    }
    if (action === 'open') {
      plugin($target.dataset, onIninstall, onUninstall);
      return;
    }
    if (action === 'select') {
      section = $target.getAttribute('value');
      render();
    }
  }

  function render() {
    const $list = $page.get('#plugin-list');
    let emptyMsg = strings['no plugins found'];
    if (section === 'all') {
      if (allState === LOADING) {
        emptyMsg = strings['loading...'];
      }
      renderAll();
    }

    if (section === 'installed') {
      if (installedState === LOADING) {
        emptyMsg = strings['loading...'];
      }
      renderInstalled();
    }

    $list.setAttribute('empty-msg', emptyMsg);
  }

  async function getAllPlugins() {
    try {
      const installed = await fsOperation(PLUGIN_DIR).lsDir();
      const file = await ajax({
        url: listJson,
        method: 'GET',
        responseType: 'text',
        contentType: 'application/x-www-form-urlencoded',
      });
      plugins.all = helpers.parseJSON(file) || [];

      // To test and develop plugin, update host in file: '/res/network_security_config.xml:11:43'
      // plugins.all.push({
      //   name: 'Plugin test',
      //   plugin: 'https://192.168.1.104:5500/plugin.json',
      //   icon: 'https://192.168.1.104:5500/icon.png',
      //   author: {
      //     name: 'DeadlyJack',
      //   }
      // });

      installed.forEach(({ url }) => {
        const plugin = plugins.all.find(({ id }) => id === Url.basename(url));
        if (plugin) {
          plugin.installed = true;
          plugin.plugin = getLocalRes(plugin.id, 'plugin.json');
        }
      });
      allState = LOADED;
    } catch (error) {
      helpers.error(error);
    }
  }

  async function getInstalledPlugins(updates) {
    const installed = await fsOperation(PLUGIN_DIR).lsDir();
    await Promise.all(installed.map(async (item) => {
      const id = Url.basename(item.url);
      if ((updates && updates.includes(id)) || !updates) {
        const url = Url.join(item.url, 'plugin.json');
        const plugin = await fsOperation(url).readFile('json');
        const { id } = plugin;
        const iconUrl = getLocalRes(id, 'icon.png');
        plugin.icon = await helpers.toInternalUri(iconUrl);
        plugin.plugin = getLocalRes(id, 'plugin.json');
        plugins.installed.push(plugin);
      }
    }));
    installedState = LOADED;
  }

  function onIninstall(pluginId) {
    const plugin = plugins.all.find(plugin => plugin.id === pluginId);
    if (plugin) {
      plugin.installed = true;
      plugins.installed.push(plugin);
    }
    render();
  }

  function onUninstall(pluginId) {
    const plugin = plugins.installed.find((plugin) => plugin.id === pluginId);
    if (plugin) {
      plugin.installed = false;
      plugins.installed = plugins.installed.filter((item) => item.id !== pluginId);
    }
    render();
  }

  function getLocalRes(id, name) {
    return Url.join(PLUGIN_DIR, id, name);
  }
}