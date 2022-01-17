export default async function CustomTheme(...args) {
  const customTheme = (
    await import(/* webpackChunkName: "customTheme" */ './customTheme.include')
  ).default;
  customTheme();
}
