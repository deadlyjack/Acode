import Url from '../utils/Url';

export default function pluginServer(req) {
  const { requestId, path } = req;
  acode.pluginServer.send(requestId, {
    status: 200,
    path: Url.join(PLUGIN_DIR, path),
  });
}