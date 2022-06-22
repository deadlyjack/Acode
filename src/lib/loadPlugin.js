import tag from "html-tag-js";
import Page from "../components/page";
import fsOperation from "./fileSystem/fsOperation";
import Url from "./utils/Url";

export default async function loadPlugin(pluginId) {
  const baseUrl = Url.join(`http://localhost:${acode.pluginServer.port}`, pluginId);
  const cacheFile = Url.join(CACHE_STORAGE, pluginId);
  const $script = tag('script', {
    src: Url.join(baseUrl, 'main.js'),
  });
  document.head.append($script);
  return new Promise((resolve) => {
    $script.onload = async () => {
      const $page = Page('Plugin');
      $page.show = () => {
        actionStack.push({
          id: 'python',
          action: $page.hide,
        });

        $page.onhide = function () {
          actionStack.remove('python');
        }

        app.append($page);
      }
      if (!await fsOperation(cacheFile).exists()) {
        await fsOperation(CACHE_STORAGE).createFile(pluginId);
      }
      acode.initPlugin(pluginId, baseUrl, $page, {
        cacheFileUrl: cacheFile,
        cacheFile: fsOperation(cacheFile)
      });
      resolve();
    }
  });
}