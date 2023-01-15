import JSZip from 'jszip';
import constants from './constants';
import dialogs from "../components/dialogs";
import fsOperation from "../fileSystem/fsOperation";
import loadPlugin from "./loadPlugin";
import helpers from "../utils/helpers";
import Url from "../utils/Url";

/**
 * Installs a plugin.
 * @param {string} id 
 * @param {string} name 
 * @param {string} purchaseToken
 */
export default async function installPlugin(id, name, purchaseToken) {
  const title = name || 'Plugin';
  const loader = dialogs.loader.create(title, strings.installing);
  let pluginDir;
  let pluginUrl;

  try {
    if (!(await fsOperation(PLUGIN_DIR).exists())) {
      await fsOperation(DATA_STORAGE).createDirectory('plugins');
    }
  } catch (error) {
    console.error(error);
  }

  if (!/^(https?|file|content):/.test(id)) {
    pluginUrl = Url.join(constants.API_BASE, 'plugin/download/', `${id}?device=${device.uuid}`);
    if (purchaseToken) pluginUrl += `&token=${purchaseToken}`;
    pluginUrl += `&package=${BuildInfo.packageName}`;
    pluginUrl += `&version=${device.version}`;

    pluginDir = Url.join(PLUGIN_DIR, id);
  } else {
    pluginUrl = id;
  }

  try {
    loader.show();

    const plugin = await fsOperation(pluginUrl).readFile(undefined, (loaded, total) => {
      loader.setMessage(`${strings.loading} ${(loaded / total * 100).toFixed(2)}%`);
    });

    if (plugin) {
      const zip = new JSZip();
      await zip.loadAsync(plugin);

      if (!zip.files['plugin.json'] || !zip.files['main.js']) {
        throw new Error(strings['invalid plugin']);
      }

      const pluginJson = JSON.parse(await zip.files['plugin.json'].async('text'));

      if (!pluginDir) {
        pluginJson.source = pluginUrl;
        id = pluginJson.id;
        pluginDir = Url.join(PLUGIN_DIR, id);
      }

      if (!await fsOperation(pluginDir).exists()) {
        await fsOperation(PLUGIN_DIR).createDirectory(id);
      }

      const promises = Object.keys(zip.files).map(async (file) => {
        let correctFile = file;
        if (/\\/.test(correctFile)) {
          correctFile = correctFile.replace(/\\/g, '/');
        }

        const fileUrl = Url.join(pluginDir, correctFile);
        if (!await fsOperation(fileUrl).exists()) {
          await helpers.createFileRecursive(pluginDir, correctFile);
        }

        if (correctFile.endsWith('/')) return;

        let data = await zip.files[file].async('ArrayBuffer');

        if (file === 'plugin.json') {
          data = JSON.stringify(pluginJson);
        }

        await fsOperation(fileUrl).writeFile(data);
      });

      await Promise.all(promises);
      await loadPlugin(id);
    }
  } catch (err) {
    try {
      await fsOperation(pluginDir).delete();
    } catch (error) {
      // ignore
    }
    throw err;
  } finally {
    loader.destroy();
  }
}