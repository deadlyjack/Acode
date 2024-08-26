import fsOperation from "../fileSystem";
import Url from "../utils/Url";
import loadPlugin from "./loadPlugin";

export default async function loadPlugins() {
	const plugins = await fsOperation(PLUGIN_DIR).lsDir();
	const promises = [];

	if (plugins.length > 0) {
		toast(strings["loading plugins"]);
	}

	plugins.forEach((pluginDir) => {
		promises.push(loadPlugin(Url.basename(pluginDir.url)));
	});
	const results = await Promise.all(promises);
	return results.length;
}
