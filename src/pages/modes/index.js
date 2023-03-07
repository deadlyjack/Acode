export default async function Modes() {
  const module = await import('./modes.js');
  const res = await module.default();
  return res;
}