import './plugin.scss';
import view from './plugin.view.js';
import Page from "../../components/page";
import helpers from '../../utils/helpers';
import { marked } from 'marked';
import Url from '../../utils/Url';
import installPlugin from '../../lib/installPlugin';
import fsOperation from '../../fileSystem/fsOperation';
import settingsPage from '../../components/settingPage';

export default async function PluginInclude(json, installed = false, onInstall, onUninstall) {
  const $page = Page('Plugin');
  let host = Url.dirname(json);
  let readme = '';
  let icon = '';
  let version = '';
  let plugin = {};
  let cancelled = false;
  let update = false;
  let remotePlugin;
  let remoteHost;

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

  helpers.showTitleLoader();

  try {
    const promises = [];
    const readmeDotMd = Url.join(host, 'readme.md');
    if (installed && json.startsWith('file:')) {
      promises.push(
        fsOperation(json).readFile('json'),
        fsOperation(readmeDotMd).readFile('utf8')
      );
      icon = Url.join(host, 'icon.png');
    } else {
      promises.push(
        fsOperation(json).readFile('json'),
      );
    }
    if (cancelled) return;
    [plugin, readme] = await Promise.all(promises);

    if (installed) {
      const settings = acode.getPluginSettings(plugin.id);
      if (settings) {
        $page.header.append(
          <span className="icon settings" onclick={() => settingsPage(plugin.name, settings)}></span>
        );
      }
    }

    version = plugin.version;
    if (!icon && plugin.icon) {
      icon = Url.join(host, plugin.icon);
    }

    $page.settitle(plugin.name);
    render();

    if (!readme && plugin.readme) {
      fsOperation(Url.join(host, plugin.readme))
        .readFile('utf8')
        .then((text) => {
          readme = text;
          render();
        });
    }

    if (installed && json.startsWith('file:')) {
      fsOperation(Url.join(plugin.host, 'plugin.json'))
        .readFile('json')
        .then((json) => {
          remotePlugin = json;
          remoteHost = plugin.host;
          if (remotePlugin.version !== version) {
            update = remotePlugin.version;
            render();
          }
        });
    } else {
      remotePlugin = plugin;
      remoteHost = host;
    }

  } catch (err) {
    helpers.error(err);
  } finally {
    helpers.hideAd();
    helpers.removeTitleLoader();
  }

  async function install() {
    if (!remotePlugin) {
      toast('Cannot install plugin');
      return;
    }

    try {
      await Promise.all([
        loadAd(this),
        installPlugin(remotePlugin, remoteHost),
      ]);
      acode.unmountPlugin(plugin.id);
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
    const isPaid = ['paid', 'premium', 'pro'].includes(plugin.type) && IS_FREE_VERSION;
    const protocol = Url.getProtocol(icon);
    if (protocol === 'file:') {
      icon = await helpers.toInternalUri(icon);
    } else if (protocol === 'content:') {
      const data = await fsOperation(icon).readFile();
      icon = await helpers.blobToBase64(new Blob([data]));
    }

    $page.content = view({
      ...plugin,
      readme,
      version,
      icon,
      body: readme ? marked(readme) : '',
      installed,
      update,
      isPaid,
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
