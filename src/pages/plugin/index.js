function plugin({ id, installed }, onInstall, onUninstall) {
  import(/* webpackChunkName: "plugins" */ './plugin').then(
    (res) => {
      const Plugin = res.default;
      Plugin(id, installed, onInstall, onUninstall);
    },
  );
}

export default plugin;
