import './plugin.scss';
import view from './plugin.view.js';
import Page from "../../components/page";
import ajax from '@deadlyjack/ajax';
import helpers from '../../utils/helpers';
import { marked } from 'marked';
import Url from '../../utils/Url';
import installPlugin from '../../lib/installPlugin';
import fsOperation from '../../fileSystem/fsOperation';
import constants from '../../lib/constants';
import dialogs from '../../components/dialogs';

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

  $page.onclick = handleClick;
  app.append($page);
  helpers.showAd();

  helpers.showTitleLoader();

  try {
    const promises = [];
    let pluginJson = '';
    if (installed && json.startsWith('file:')) {
      promises.push(
        fsOperation(json).readFile('utf8'),
        fsOperation(
          Url.join(host, 'readme.md'),
        ).readFile('utf8')
      );
      icon = Url.join(host, 'icon.png');
    } else {
      promises.push(
        ajax({
          url: json,
          responseType: 'text',
          contentType: 'application/x-www-form-urlencoded',
        }),
      );
    }
    if (cancelled) return;
    [pluginJson, readme] = await Promise.all(promises);
    plugin = helpers.parseJSON(pluginJson);

    version = plugin.version;
    if (!icon && plugin.icon) {
      icon = Url.join(host, plugin.icon);
    }

    $page.settitle(plugin.name);
    render();

    if (!readme && plugin.readme) {
      ajax({
        url: Url.join(host, plugin.readme),
        responseType: 'text',
        contentType: 'application/x-www-form-urlencoded',
      })
        .then((text) => {
          readme = text;
          render();
        });
    }

    if (installed && json.startsWith('file:')) {
      ajax({
        url: Url.join(plugin.host, 'plugin.json'),
        responseType: 'text',
        contentType: 'application/x-www-form-urlencoded',
      }).then((json) => {
        remotePlugin = helpers.parseJSON(json);
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

  function handleClick(e) {
    const $target = e.target;
    const action = $target.getAttribute('action');
    if (action === 'buy') {
      system.openInBrowser(constants.PAID_VERSION)
      return;
    }
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
    if (Url.getProtocol(icon) === 'file:') {
      icon = await helpers.toInternalUri(icon);
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
      let isAdLoaded = await window.iad?.isLoaded();
      if (!isAdLoaded) {
        const oldText = el.textContent;
        el.textContent = strings['loading...'];
        await window.iad.load();
        el.textContent = oldText;
        isAdLoaded = true;
      }
    } catch (error) { }
  }
}
