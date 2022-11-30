import mustache from 'mustache'
import template from './plugins.hbs';
import list from './list.hbs';
import Page from "../../components/page";
import helpers from "../../utils/helpers";
import searchBar from "../../components/searchbar";
import fsOperation from "../../fileSystem/fsOperation";
import Url from "../../utils/Url";
import plugin from "../plugin/plugin";
import dialogs from "../../components/dialogs";
import constants from "../../lib/constants";
import alert from "../../components/dialogboxes/alert";
import FileBrowser from "../fileBrowser/fileBrowser";
import gh2cdn from '../../utils/gh2cdn';

/**
 * 
 * @param {Array<PluginJson>} updates 
 */
export default function PluginsInclude(updates) {
  const LOADING = 0;
  const LOADED = 1;
  const $page = Page(strings['plugins']);
  const $search = <span className="icon search" data-action='search'></span>;
  const $add = <span className="icon add" data-action='add-source' onclick={() => addSource()}></span>;
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
  $page.header.append($search, $add);

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
    $page.get('[data-action="select"].active')?.classList.remove('active');
    $page.get('[data-action="select"][value="all"]')?.classList.add('active');
    $page
      .get('#plugin-list')
      .innerHTML = mustache.render(list, plugins.all);
  }

  function renderInstalled() {
    $page.get('[data-action="select"].active')?.classList.remove('active');
    $page.get('[data-action="select"][value="installed"]')?.classList.add('active');
    $page
      .get('#plugin-list')
      .innerHTML = mustache.render(list, plugins.installed);
  }

  function handleClick(event) {
    const $target = event.target;
    const { action } = $target.dataset;
    if (action === 'search') {
      searchBar($page.get('#plugin-list'));
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
      plugins.all = await fsOperation(
        gh2cdn(constants.PLUGIN_LIST),
      ).readFile('json');

      plugins.all = plugins.all.map((plugin) => {
        plugin.icon = gh2cdn(plugin.icon);
        return plugin;
      });

      installed.forEach(({ url }) => {
        const plugin = plugins.all.find(({ id }) => id === Url.basename(url));
        if (plugin) {
          plugin.installed = true;
          plugin.localPlugin = getLocalRes(plugin.id, 'plugin.json');
        }
      });
      allState = LOADED;
      if (section === 'all') {
        render();
      }
    } catch (error) {
      helpers.error(error);
    }
  }

  async function getInstalledPlugins(updates) {
    const installed = await fsOperation(PLUGIN_DIR).lsDir();
    if (!installed.length) {
      section = 'all';
      render();
    }
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
    const plugin = plugins.all.find((plugin) => plugin.id === pluginId);
    plugins.installed = plugins.installed.filter((plugin) => plugin.id !== pluginId);
    if (plugin) {
      plugin.installed = false;
      plugin.localPlugin = null;
    }
    render();
  }

  function getLocalRes(id, name) {
    return Url.join(PLUGIN_DIR, id, name);
  }

  async function addSource(value = 'https://') {

    const sourceType = await dialogs.select('', [
      ['remote', strings.remote],
      ['local', strings.local],
    ], true);

    let source;

    if (sourceType === 'remote') {
      source = await dialogs.prompt('Enter plugin source', value, 'url');
    } else {
      source = (await FileBrowser('folder', 'Select plugin source')).url;
    }

    const json = Url.join(source, 'plugin.json');
    try {
      helpers.showTitleLoader();
      const data = await fsOperation(json).readFile('json');

      if (data) {
        const { id } = data;
        plugin({
          installed: plugins.installed.includes(id),
          plugin: json,
        }, onIninstall, onUninstall);
      }
    } catch (error) {
      const message = helpers.errorMessage(error);
      alert(strings.error, message || 'Unable to add source.', () => addSource(source));
    } finally {
      helpers.removeTitleLoader();
    }
  }
}