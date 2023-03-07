import './plugins.scss';

import Page from "../../components/page";
import helpers from "../../utils/helpers";
import searchBar from "../../components/searchbar";
import fsOperation from "../../fileSystem";
import Url from "../../utils/Url";
import plugin from "../plugin";
import dialogs from "../../components/dialogs";
import constants from "../../lib/constants";
import FileBrowser from "../fileBrowser";
import PluginList from './pluginList';
import installPlugin from '../../lib/installPlugin';
import Ref from 'html-tag-js/ref';
import TabView from '../../components/tabView';

/**
 * 
 * @param {Array<object>} updates 
 */
export default function PluginsInclude(updates) {
  const LOADING = 0;
  const LOADED = 1;
  const $page = Page(strings['plugins']);
  const $search = <span className="icon search" data-action='search'></span>;
  const $add = <span className="icon add" data-action='add-source' onclick={() => addSource()}></span>;
  const $list = new Ref();
  const plugins = {
    all: [],
    installed: [],
    owned: [],
  };
  let section = 'installed';
  let allState = LOADING;
  let installedState = LOADING;

  $page.body = <TabView id='plugins'>
    <div className='options'>
      <span id='installed_plugins' onclick={renderInstalled} tabindex='0' className='active'>{strings.installed}</span>
      <span id='all_plugins' onclick={renderAll} tabindex='0'>{strings.all}</span>
      <span id='owned_plugins' onclick={renderOwned} tabindex='0'>{strings.owned}</span>
    </div>
    <div ref={$list} id='plugin-list' className='list scroll' empty-msg={strings['loading...']}></div>
  </TabView>;
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

  if (navigator.onLine) {
    getAllPlugins();
    getOwned();
  }
  getInstalledPlugins()
    .then(() => {
      render();
    });

  function handleClick(event) {
    const $target = event.target;
    const { action } = $target.dataset;
    if (action === 'search') {
      searchBar($list.el);
      return;
    }
    if (action === 'open') {
      plugin($target.dataset, onIninstall, onUninstall);
      return;
    }
  }

  function render(section = 'installed') {
    let emptyMsg = strings['no plugins found'];
    if (
      section === 'installed' && installedState === LOADING
      || section === 'all' && allState === LOADING
    ) {
      emptyMsg = strings['loading...'];
    }
    $list.attr('empty-msg', strings['no plugins found']);
    $list.el.content = <PluginList plugins={plugins[section]} />;
  }

  function renderAll() {
    render('all');
  }

  function renderInstalled() {
    render('installed');
  }

  function renderOwned() {
    render('owned');
  }

  async function getAllPlugins() {
    plugins.all = [];
    try {
      const installed = await fsOperation(PLUGIN_DIR).lsDir();
      plugins.all = await fsOperation(constants.API_BASE, 'plugins').readFile('json');

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
      console.error(error);
    }
  }

  async function getInstalledPlugins(updates) {
    plugins.installed = [];
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
        plugin.installed = true;
        plugins.installed.push(plugin);
      }
    }));
    installedState = LOADED;
  }

  async function getOwned() {
    const purchases = await helpers.promisify(iap.getPurchases);
    purchases.forEach(async ({ productIds }) => {
      const [sku] = productIds;
      const url = Url.join(constants.API_BASE, 'plugin/owned', sku);
      const plugin = await fsOperation(url).readFile('json');
      const isInstalled = plugins.installed.find(({ id }) => id === plugin.id);
      plugin.installed = !!isInstalled;
      plugins.owned.push(plugin);
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

  async function addSource(value = 'https://', sourceType) {

    if (!sourceType) {
      sourceType = await dialogs.select('', [
        ['remote', strings.remote],
        ['local', strings.local],
      ], true);
    }

    let source;

    if (sourceType === 'remote') {
      source = await dialogs.prompt('Enter plugin source', value, 'url');
    } else {
      source = (await FileBrowser('file', 'Select plugin source')).url;
    }

    try {
      await installPlugin(source);
      await getInstalledPlugins();
      render();
    } catch (error) {
      window.toast(helpers.errorMessage(error));
      addSource(source, sourceType);
    }
  }
}