import ajax from "@deadlyjack/ajax";
import mustache from 'mustache'
import tag from "html-tag-js";
import template from './plugins.hbs';
import list from './list.hbs';
import Page from "../../components/page";
import helpers from "../../lib/utils/helpers";
import searchBar from "../../components/searchbar";
import fsOperation from "../../lib/fileSystem/fsOperation";
import Url from "../../lib/utils/Url";
import plugin from "../plugin/plugin";

/**
 * 
 * @param {Array<PluginJson>} updates 
 */
export default function PluginsInclude(updates) {
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
  $page.append(
    tag.parse(
      mustache.render(template, { msg: `${strings.loading}...` }),
    ),
  );
  $page.querySelector('header').append($search);

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

  getInstalledPlugins()
    .then(() => {
      render();
    });

  (async function () {
    helpers.showTitleLoader();
    try {
      try {
        await getAllPlugins();
      } catch (error) { }
    } catch (error) {
      helpers.error(error);
    } finally {
      $page.get('#plugin-list')?.setAttribute('empty-msg', 'No plugins found');
      helpers.removeTitleLoader();
    }
  })();

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
    if (section === 'all') {
      renderAll();
      return;
    }

    if (section === 'installed') {
      renderInstalled();
      return;
    }
  }

  async function getAllPlugins() {
    const file = await ajax({
      url: listJson,
      method: 'GET',
      responseType: 'text',
    });
    plugins.all = helpers.parseJSON(file) || [];

    plugins.all.push({
      name: 'Python local',
      icon: 'https://172.16.0.167:5500/icon.png',
      plugin: 'https://172.16.0.1667:5500/plugin.json',
      autho: {
        name: 'Ajit Kumar'
      }
    });

    if (plugins.installed.length) {
      plugins.installed.forEach((localPlugin) => {
        const plugin = plugins.all.find((plugin) => plugin.name === localPlugin.name);
        if (plugin) {
          plugin.installed = true;
          plugin.plugin = localPlugin.plugin;
        }
      });
    }
  }

  async function getInstalledPlugins(updates) {
    const installed = await fsOperation(PLUGIN_DIR).lsDir();
    const promises = [];
    installed.forEach((item) => {
      const id = Url.basename(item.url);
      if ((updates && updates.includes(id)) || !updates) {
        promises.push(
          fsOperation(
            Url.join(item.url, 'plugin.json'),
          ).readFile('json'),
        );
      }
    });

    plugins.installed = await Promise.all(promises);
    plugins.installed.forEach((localPlugin) => {
      localPlugin.icon = getLocalRes(localPlugin.id, 'icon.png');
      localPlugin.plugin = getLocalRes(localPlugin.id, 'plugin.json');
    });
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