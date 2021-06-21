export default async function customTheme(...args){
  const customTheme = (await import('./customTheme.include')).default;
  customTheme();
}