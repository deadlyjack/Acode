function plugin({ id, installed, install }, onInstall, onUninstall) {
	import(/* webpackChunkName: "plugins" */ "./plugin").then((res) => {
		const Plugin = res.default;
		Plugin(id, installed, onInstall, onUninstall, install);
	});
}

export default plugin;
