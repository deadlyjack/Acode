import ajax from "@deadlyjack/ajax";
import fsOperation from "../fileSystem/fsOperation";
import Url from "../utils/Url";

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

        const res = await ajax({
          url: `https://acode.foxdebug.com/api/plugin/check-update/${plugin.id}/${plugin.version}`,
        });

        if (res.update) {
          updates.push(plugin.id);
        }
      })(),
    );
  });

  await Promise.all(promises);
  return updates;
}