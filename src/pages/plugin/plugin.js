function plugin({ plugin, installed }, onInstall, onUninstall) {
  import(/* webpackChunkName: "plugins" */ './plugin.include').then(
    (res) => {
      const Plugin = res.default;
      Plugin(plugin, installed, onInstall, onUninstall);
    },
  );
}

export default plugin;
