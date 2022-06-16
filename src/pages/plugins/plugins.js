function plugins(updates) {
  import(/* webpackChunkName: "plugins" */ './plugins.include').then(
    (res) => {
      const Plugins = res.default;
      Plugins(updates);
    },
  );
}

export default plugins;
