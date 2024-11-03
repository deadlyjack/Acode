import fsOperation from "../fileSystem";
import Url from "../utils/Url";
import loadPlugin from "./loadPlugin";

export default async function loadPlugins() {
	const plugins = await fsOperation(PLUGIN_DIR).lsDir();
	const results = [];

	if (plugins.length > 0) {
		toast(strings["loading plugins"]);
	}

	// Load plugins sequentially to better handle errors
	for (const pluginDir of plugins) {
		const pluginId = Url.basename(pluginDir.url);
		try {
			await loadPlugin(pluginId);
			results.push(true);
		} catch (error) {
			window.log("error", `Failed to load plugin: ${pluginId}`);
			window.log("error", error);
			toast(`Failed to load plugin: ${pluginId}`);
			results.push(false);
		}
	}

	return results.filter(Boolean).length;
}
