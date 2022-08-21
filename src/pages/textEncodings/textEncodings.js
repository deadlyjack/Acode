export default async function TextEncodings() {
  const module = await import('./textEncodings.include.js');
  const res = await module.default();
  return res;
}