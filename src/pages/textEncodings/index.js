export default async function TextEncodings() {
  const module = await import('./textEncodings.js');
  const res = await module.default();
  return res;
}