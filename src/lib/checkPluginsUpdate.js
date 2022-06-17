import ajax from "@deadlyjack/ajax";
import fsOperation from "./fileSystem/fsOperation";
import helpers from "./utils/helpers";
import Url from "./utils/Url";

export default async function checkPluginsUpdate() {
  const plugins = await fsOperation(PLUGIN_DIR).lsDir();
  const promises = [];
  const updates = [];

  plugins.forEach((pluginDir) => {
    promises.push(
      (async () => {
        const plugin = await fsOperation(
          Url.join(pluginDir.url, 'plugin.json'),
        ).readFile('json');

        const pluginRemote = helpers.parseJSON(
          await ajax({
            url: Url.join(plugin.host, 'plugin.json'),
            method: 'GET',
            responseType: 'text',
          }),
        );

        if (plugin.version !== pluginRemote?.version) {
          updates.push(plugin.id);
        }
      })(),
    );
  });

  await Promise.all(promises);
  return updates;
}