import ajax from "@deadlyjack/ajax";
import dialogs from "../components/dialogs";
import fsOperation from "../fileSystem/fsOperation";
import loadPlugin from "./loadPlugin";
import helpers from "../utils/helpers";
import Url from "../utils/Url";

/**
 * Installs a plugin.
 * @param {PluginJson} plugin 
 */
export default async function installPlugin(plugin, host) {
  const loader = dialogs.loader.create(plugin.name, strings.installing);
  let pluginDir;
  try {
    plugin.host = host;
    plugin.installed = true;

    const mainJs = Url.join(host, plugin.main);
    const rootDir = Url.dirname(mainJs);
    const { files } = plugin;

    pluginDir = Url.join(PLUGIN_DIR, plugin.id);

    // create plugin directory
    if (
      await fsOperation(pluginDir)
        .exists()
    ) {
      await fsOperation(pluginDir)
        .delete();
    }

    const readFiles = [];

    readFiles.push(
      ajax({
        url: mainJs,
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseType: 'arraybuffer',
        onprogress(loaded, total) {
          progress(plugin.name, loaded / total);
        }
      }),
      ajax({
        url: Url.join(host, plugin.icon),
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseType: 'arraybuffer',
        onprogress(loaded, total) {
          progress('icon', loaded / total);
        }
      }),
      ajax({
        url: Url.join(host, plugin.readme),
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseType: 'arraybuffer',
        onprogress(loaded, total) {
          progress('readme', loaded / total);
        }
      }),
    );

    const [main, icon, readme] = await Promise.all(readFiles);
    await fsOperation(PLUGIN_DIR)
      .createDirectory(plugin.id);

    const promises = [];

    promises.push(
      fsOperation(pluginDir)
        .createFile(
          'main.js',
          main
        ),
      fsOperation(pluginDir)
        .createFile(
          'plugin.json',
          JSON.stringify(plugin, null, 2)
        ),
      fsOperation(pluginDir)
        .createFile(
          'readme.md',
          readme
        ),
      fsOperation(pluginDir)
        .createFile(
          'icon.png',
          icon
        ),
    );

    // copy files
    if (Array.isArray(files)) {
      files.forEach((file) => {
        promises.push(
          (async () => {
            await helpers
              .createFileRecursive(pluginDir, file);
            await fsOperation(Url.join(pluginDir, file))
              .writeFile(
                await ajax({
                  url: Url.join(rootDir, file),
                  method: 'GET',
                  contentType: 'application/x-www-form-urlencoded',
                  responseType: 'arraybuffer',
                  onprogress(loaded, total) {
                    progress(file, loaded / total);
                  }
                }),
              );
          })(),
        );
      });
    }

    await Promise.all(promises);
    toast(strings.success);

    loadPlugin(plugin.id);
  } catch (err) {
    if (pluginDir) {
      await fsOperation(pluginDir).delete();
    }
    throw new Error('Cannot install plugin');
  } finally {
    dialogs.loader.destroy();
  }

  function progress(label, ratio) {
    const percent = Math.round(ratio * 10000) / 100;
    loader.setTitle(`${plugin.name}`);
    loader.setMessage(`file: ${label}
${strings.installing} ${Math.min(percent, 100)}%`);
  }
}