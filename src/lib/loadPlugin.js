import Page from "components/page";
import fsOperation from "fileSystem";
import helpers from "utils/helpers";
import Url from "utils/Url";
import actionStack from './actionStack';

export default async function loadPlugin(pluginId, justInstalled = false) {
  const baseUrl = await helpers.toInternalUri(Url.join(PLUGIN_DIR, pluginId));
  const cacheFile = Url.join(CACHE_STORAGE, pluginId);
  const $script = <script src={Url.join(baseUrl, 'main.js')}></script>;
  document.head.append($script);
  return new Promise((resolve) => {
    $script.onload = async () => {
      const $page = Page('Plugin');
      $page.show = () => {
        actionStack.push({
          id: pluginId,
          action: $page.hide,
        });

        app.append($page);
      };

      $page.onhide = function () {
        actionStack.remove(pluginId);
      };

      if (!await fsOperation(cacheFile).exists()) {
        await fsOperation(CACHE_STORAGE).createFile(pluginId);
      }
      try {
        await acode.initPlugin(pluginId, baseUrl, $page, {
          cacheFileUrl: await helpers.toInternalUri(cacheFile),
          cacheFile: fsOperation(cacheFile),
          firstInit: justInstalled,
        });
      } catch (error) {
        toast(`Error loading plugin ${pluginId}: ${error.message}`);
      }
      resolve();
    };
  });
}