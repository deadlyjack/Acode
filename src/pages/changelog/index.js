function plugin({ id, installed }, onInstall, onUninstall) {
	import(/* webpackChunkName: "changelog" */ "./changelog").then((res) => {
		const Changelog = res.default;
		Changelog();
	});
}

export default plugin;
