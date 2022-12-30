import './plugin.scss';
import view from './plugin.view.js';
import Page from "../../components/page";
import helpers from '../../utils/helpers';
import { marked } from 'marked';
import Url from '../../utils/Url';
import installPlugin from '../../lib/installPlugin';
import fsOperation from '../../fileSystem/fsOperation';
import settingsPage from '../../components/settingPage';

export default async function PluginInclude(id, installed, onInstall, onUninstall) {
  installed = installed === 'true';
  const $page = Page(strings['plugin']);
  let plugin = {};
  let cancelled = false;
  let update = false;
  let currentVersion = '';

  actionStack.push({
    id: 'plugin',
    action: $page.hide,
  });

  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('plugin');
    helpers.removeTitleLoader();
    cancelled = true;
  };

  app.append($page);
  helpers.showAd();


  try {
    if (installed) {
      const installedPlugin = await fsOperation(Url.join(PLUGIN_DIR, id, 'plugin.json')).readFile('json');
      const settings = acode.getPluginSettings(id);
      const { author } = installedPlugin;
      const description = await fsOperation(Url.join(PLUGIN_DIR, id, 'readme.md')).readFile('utf-8');
      const iconUrl = await helpers.toInternalUri(Url.join(PLUGIN_DIR, id, 'icon.png'));
      const iconData = await fsOperation(iconUrl).readFile();
      const icon = URL.createObjectURL(new Blob([iconData], { type: 'image/png' }));
      plugin = {
        id,
        icon,
        name: installedPlugin.name,
        version: installedPlugin.version,
        author: author.name,
        author_github: author.github,
        source: installedPlugin.source,
        description,
      };
      if (settings) {
        $page.header.append(
          <span className="icon settings" onclick={() => settingsPage(plugin.name, settings)}></span>
        );
      }
    }

    try {
      if (navigator.onLine && (isValidSource(plugin.source) || !installed)) {
        helpers.showTitleLoader();
        const remotePlugin = await fsOperation(`https://acode.foxdebug.com/api/plugin/${id}`)
          .readFile('json');
        if (cancelled) return;

        if (remotePlugin) {
          if (installed && remotePlugin?.version !== plugin.version) {
            currentVersion = plugin.version;
            update = true;
          }
          plugin = Object.assign({}, remotePlugin);
        }
      }
    } catch (error) {
      console.error(error);
    }

    $page.settitle(plugin.name);
    render();

  } catch (err) {
    helpers.error(err);
  } finally {
    helpers.hideAd();
    helpers.removeTitleLoader();
  }

  async function install() {
    try {
      await Promise.all([
        loadAd(this),
        installPlugin(plugin.source || id, plugin.name),
      ]);
      if (onInstall) onInstall(plugin.id);
      installed = true;
      update = false;
      if (IS_FREE_VERSION && await window.iad?.isLoaded()) {
        window.iad.show();
      }
      render();
    } catch (err) {
      helpers.error(err);
    }
  }

  async function uninstall() {
    try {
      const pluginDir = Url.join(PLUGIN_DIR, plugin.id);
      await Promise.all([
        loadAd(this),
        fsOperation(pluginDir)
          .delete(),
      ]);
      acode.unmountPlugin(plugin.id);
      if (onUninstall) onUninstall(plugin.id);
      installed = false;
      update = false;
      if (IS_FREE_VERSION && await window.iad?.isLoaded()) {
        window.iad.show();
      }
      render();
    } catch (err) {
      helpers.error(err);
    }
  }

  async function render() {
    $page.body = view({
      ...plugin,
      body: marked(plugin.description),
      installed,
      update,
      currentVersion,
      install,
      uninstall,
    });
  }

  async function loadAd(el) {
    if (!IS_FREE_VERSION) return;
    try {
      if (!await window.iad?.isLoaded()) {
        const oldText = el.textContent;
        el.textContent = strings['loading...'];
        await window.iad.load();
        el.textContent = oldText;
      }
    } catch (error) { }
  }
}

function isValidSource(source) {
  return source ? source.startsWith('https://acode.foxdebug.com/api/plugin/') : true;
}
