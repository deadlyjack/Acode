import fsOperation from "./fileSystem/fsOperation";
import loadPlugin from "./loadPlugin";
import Url from "./utils/Url";

export default async function loadPlugins() {
  const plugins = await fsOperation(PLUGIN_DIR).lsDir();
  const promises = [];
  plugins.forEach((pluginDir) => {
    promises.push(
      loadPlugin(
        Url.basename(pluginDir.url),
      )
    )
  });
  const results = await Promise.all(promises);
  return results.length;
}