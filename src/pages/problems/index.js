function plugin({ id, installed }, onInstall, onUninstall) {
	import(/* webpackChunkName: "problems" */ "./problems").then((res) => {
		const Problems = res.default;
		Problems();
	});
}

export default plugin;
