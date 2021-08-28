export default function themeSetting(...args) {
  import(/* webpackChunkName: "themeSetting" */ './themeSetting.include').then(
    (module) => {
      module.default(...args);
    }
  );
}
