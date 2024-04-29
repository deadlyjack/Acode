import './plugins.scss';

import Item from './item';
import Url from "utils/Url";
import Plugin from "pages/plugin";
import Page from "components/page";
import helpers from "utils/helpers";
import fsOperation from "fileSystem";
import constants from "lib/constants";
import TabView from 'components/tabView';
import searchBar from "components/searchbar";
import FileBrowser from "pages/fileBrowser";
import installPlugin from 'lib/installPlugin';
import prompt from 'dialogs/prompt';
import actionStack from 'lib/actionStack';
import Contextmenu from 'components/contextmenu';

/**
 * 
 * @param {Array<object>} updates 
 */
export default function PluginsInclude(updates) {
  const $page = Page(strings['plugins']);
  const $search = <span className="icon search" data-action='search'></span>;
  const $add = <span className="icon add" data-action='add-source'></span>;
  const List = () => <div id='plugin-list' className='list scroll' empty-msg={strings['loading...']}></div>;
  const $list = {
    all: <List />,
    installed: <List />,
    owned: <List />,
  };
  const plugins = {
    all: [],
    installed: [],
    owned: [],
  };
  let $currList = $list.installed;
  let currSection = 'installed';

  Contextmenu({
    toggler: $add,
    top: '8px',
    right: '8px',
    items: [
      [strings.remote, 'remote'],
      [strings.local, 'local'],
    ],
    onselect(item) {
      addSource(item);
    },
  });

  $page.body = <TabView id='plugins'>
    <div className='options'>
      <span id='installed_plugins' onclick={renderInstalled} tabindex='0' className='active'>{strings.installed}</span>
      <span id='all_plugins' onclick={renderAll} tabindex='0'>{strings.all}</span>
      <span id='owned_plugins' onclick={renderOwned} tabindex='0'>{strings.owned}</span>
    </div>
    {$list.installed}
  </TabView>;
  $page.header.append($search, $add);

  actionStack.push({
    id: 'plugins',
    action: $page.hide,
  });

  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('plugins');
  };

  $page.onconnect = () => {
    $currList.scrollTop = $currList._scroll || 0;
  };

  $page.onwilldisconnect = () => {
    $currList._scroll = $currList.scrollTop;
  };

  $page.onclick = handleClick;

  app.append($page);
  helpers.showAd();

  if (updates) {
    $page.get('.options').style.display = 'none';
    $page.settitle(strings.update);
    getInstalledPlugins(updates)
      .then(() => {
        render('installed');
      });
    return;
  }

  if (navigator.onLine) {
    getAllPlugins();
    getOwned();
  }

  getInstalledPlugins()
    .then(() => {
      if (plugins.installed.length) {
        return;
      }

      render('all');
    });

  function handleClick(event) {
    const $target = event.target;
    const { action } = $target.dataset;
    if (action === 'search') {
      searchBar($currList);
      return;
    }
    if (action === 'open') {
      Plugin($target.dataset, onInstall, onUninstall);
      return;
    }
  }

  function render(section) {
    if (currSection === section) return;

    if (!section) {
      section = currSection;
    }

    const $section = $list[section];
    $currList._scroll = $currList.scrollTop;
    $currList.replaceWith($section);
    $section.scrollTop = $section._scroll || 0;
    $currList = $section;
    currSection = section;
    $page.get('.options .active').classList.remove('active');
    $page.get(`#${section}_plugins`).classList.add('active');
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
    try {
      plugins.all = [];
      $list.all.setAttribute('empty-msg', strings['loading...']);
      const installed = await fsOperation(PLUGIN_DIR).lsDir();
      plugins.all = await fsOperation(constants.API_BASE, 'plugins').readFile('json');

      installed.forEach(({ url }) => {
        const plugin = plugins.all.find(({ id }) => id === Url.basename(url));
        if (plugin) {
          plugin.installed = true;
          plugin.localPlugin = getLocalRes(plugin.id, 'plugin.json');
        }
      });

      plugins.all.forEach((plugin) => {
        $list.all.append(<Item {...plugin} />);
      });

      $list.all.setAttribute('empty-msg', strings['no plugins found']);
    } catch (error) {
      console.error(error);
    }
  }

  async function getInstalledPlugins(updates) {
    $list.installed.setAttribute('empty-msg', strings['loading...']);
    plugins.installed = [];
    const installed = await fsOperation(PLUGIN_DIR).lsDir();
    await Promise.all(installed.map(async (item) => {
      const id = Url.basename(item.url);
      if (!((updates && updates.includes(id)) || !updates)) return;
      const url = Url.join(item.url, 'plugin.json');
      const plugin = await fsOperation(url).readFile('json');
      const iconUrl = getLocalRes(id, 'icon.png');
      plugin.icon = await helpers.toInternalUri(iconUrl);
      plugin.installed = true;
      plugins.installed.push(plugin);
      if ($list.installed.get(`[data-id="${id}"]`)) return;
      $list.installed.append(<Item {...plugin} />);
    }));
    $list.installed.setAttribute('empty-msg', strings['no plugins found']);
  }

  async function getOwned() {
    $list.owned.setAttribute('empty-msg', strings['loading...']);
    const purchases = await helpers.promisify(iap.getPurchases);
    purchases.forEach(async ({ productIds }) => {
      const [sku] = productIds;
      const url = Url.join(constants.API_BASE, 'plugin/owned', sku);
      const plugin = await fsOperation(url).readFile('json');
      const isInstalled = plugins.installed.find(({ id }) => id === plugin.id);
      plugin.installed = !!isInstalled;
      plugins.owned.push(plugin);
      $list.owned.append(<Item {...plugin} />);
    });
    $list.owned.setAttribute('empty-msg', strings['no plugins found']);
  }

  function onInstall(pluginId) {
    if (updates) return;
    const plugin = plugins.all.find(plugin => plugin.id === pluginId);
    if (plugin) {
      plugin.installed = true;
      plugins.installed.push(plugin);
    }

    $list.installed.append(<Item {...plugin} />);
  }

  function onUninstall(pluginId) {
    if (!updates) {
      const plugin = plugins.all.find((plugin) => plugin.id === pluginId);
      plugins.installed = plugins.installed.filter((plugin) => plugin.id !== pluginId);
      if (plugin) {
        plugin.installed = false;
        plugin.localPlugin = null;
      }
    }

    $list.installed.get(`[data-id="${pluginId}"]`).remove();
  }

  function getLocalRes(id, name) {
    return Url.join(PLUGIN_DIR, id, name);
  }

  async function addSource(sourceType, value = 'https://') {
    let source;

    const clipboardData = await getClipboardData();

    if (clipboardData && clipboardData.startsWith('https')) {
      value = clipboardData;
    }

    if (sourceType === 'remote') {
      source = await prompt('Enter plugin source', value, 'url');
    } else {
      source = (await FileBrowser('file', 'Select plugin source')).url;
    }

    if (!source) return;

    try {
      await installPlugin(source);
      await getInstalledPlugins();
    } catch (error) {
      window.toast(helpers.errorMessage(error));
      addSource(sourceType, source);
    }
  }

  async function getClipboardData() {
    return new Promise((resolve) => {
      const { clipboard } = cordova.plugins;
      clipboard.paste(resolve);
    });
  }
}