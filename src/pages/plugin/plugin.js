import './plugin.scss';
import view from './plugin.view.js';
import Page from "../../components/page";
import helpers from '../../utils/helpers';
import { marked } from 'marked';
import Url from '../../utils/Url';
import installPlugin from '../../lib/installPlugin';
import fsOperation from '../../fileSystem';
import settingsPage from '../../components/settingPage';
import constants from '../../lib/constants';
import purchaseListner from '../../handlers/purchase';
import ajax from '@deadlyjack/ajax';
import alert from '../../components/dialogboxes/alert';

export default async function PluginInclude(id, installed, onInstall, onUninstall) {
  installed = typeof installed !== 'boolean' ? installed === 'true' : installed;
  const $page = Page(strings['plugin']);

  let plugin = {};
  let currentVersion = '';
  let purchased = false;
  let cancelled = false;
  let update = false;
  let isPaid = false;
  let price;
  let product;
  let purchaseToken;

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

      isPaid = installedPlugin.price > 0;

      if (settings) {
        $page.header.append(
          <span attr-action='settings' className='icon settings' onclick={() => settingsPage(plugin.name, settings.list, settings.cb)}></span>
        );
      }
    }

    await (async () => {
      try {
        helpers.showTitleLoader();
        if (await helpers.checkAPIStatus() && (isValidSource(plugin.source))) {
          helpers.showTitleLoader();
          const remotePlugin = await fsOperation(constants.API_BASE, `plugin/${id}`)
            .readFile('json')
            .catch(() => null);

          if (cancelled || !remotePlugin) return;

          if (installed && remotePlugin?.version !== plugin.version) {
            currentVersion = plugin.version;
            update = true;
          }

          plugin = Object.assign({}, remotePlugin);

          if (!parseFloat(remotePlugin.price)) return;

          isPaid = remotePlugin.price > 0;
          try {
            [product] = await helpers.promisify(iap.getProducts, [remotePlugin.sku]);
            if (product) {
              const purchase = await getPurchase(product.productId);
              purchased = !!purchase;
              price = product.price;
              purchaseToken = purchase?.purchaseToken;
            }
          } catch (error) {
            helpers.error(error);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        helpers.removeTitleLoader();
      }
    })();

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
        installPlugin(plugin.source || id, plugin.name, purchaseToken),
      ]);
      if (onInstall) onInstall(plugin.id);
      installed = true;
      update = false;
      if (!plugin.price && IS_FREE_VERSION && await window.iad?.isLoaded()) {
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
      if (!plugin.price && IS_FREE_VERSION && await window.iad?.isLoaded()) {
        window.iad.show();
      }
      render();
    } catch (err) {
      helpers.error(err);
    }
  }

  async function buy(e) {
    const $button = e.target;
    const oldText = $button.textContent;

    try {
      if (!product) throw new Error('Product not found');
      const apiStatus = await helpers.checkAPIStatus();

      if (!apiStatus) {
        alert(strings.error, strings.api_error);
        return;
      }

      iap.setPurchaseUpdatedListener(...purchaseListner(onpurchase, onerror));
      $button.textContent = strings['loading...'];
      await helpers.promisify(iap.purchase, product.json);

      async function onpurchase(e) {
        const purchase = await getPurchase(product.productId);
        await ajax.post(Url.join(constants.API_BASE, 'plugin/order'), {
          data: {
            id: plugin.id,
            token: purchase?.purchaseToken,
            package: BuildInfo.packageName,
          }
        });
        purchaseToken = purchase?.purchaseToken;
        purchased = !!purchase;
        $button.textContent = oldText;
        install();
      }

      async function onerror(error) {
        helpers.error(error);
        $button.textContent = oldText;
      }

    } catch (error) {
      helpers.error(error);
      $button.textContent = oldText;
    }
  }

  async function refund(e) {
    const $button = e.target;
    const oldText = $button.textContent;
    try {
      if (!product) throw new Error('Product not found');
      $button.textContent = strings['loading...'];
      const { refer, refunded, error } = await ajax.post(Url.join(constants.API_BASE, 'plugin/refund'), {
        data: {
          id: plugin.id,
          package: BuildInfo.packageName,
          token: purchaseToken,
        }
      });
      if (refer) {
        system.openInBrowser(refer);
        return;
      }

      if (refunded) {
        toast(strings.success);
        if (installed) uninstall();
        else render();
        return;
      }

      toast(error || strings.error);
    } catch (error) {
      helpers.error(error);
    } finally {
      $button.textContent = oldText;
    }
  }

  async function render() {
    $page.body = view({
      ...plugin,
      body: marked(plugin.description),
      purchased,
      installed,
      update,
      isPaid,
      price,
      buy,
      refund,
      install,
      uninstall,
      currentVersion,
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

  async function getPurchase(sku) {
    const purchases = await helpers.promisify(iap.getPurchases);
    const purchase = purchases.find((p) => p.productIds.includes(sku));
    return purchase;
  }
}

function isValidSource(source) {
  return source ? source.startsWith(Url.join(constants.API_BASE, 'plugin')) : true;
}
