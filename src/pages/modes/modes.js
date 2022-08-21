export default async function Modes() {
  const module = await import('./modes.include.js');
  const res = await module.default();
  return res;
}