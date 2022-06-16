export default async function createPluginServer(port = 5501) {
  let server;
  try {
    server = await new Promise((resolve, reject) => {
      const s = CreateServer(port, () => resolve(s), reject);
    });
  } catch (error) {
    if (/EADDRINUSE/.test(error.message || error)) {
      server = await createPluginServer(port + 1)
    } else {
      throw error;
    }
  }
  return server;
}