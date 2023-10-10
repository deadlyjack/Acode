import fsOperation from 'fileSystem';
import openFile from 'lib/openFile';
import helpers from 'utils/helpers';

/**
 *
 * @param {Intent} intent
 */
export default async function HandleIntent(intent = {}) {
  const type = intent.action.split('.').slice(-1)[0];

  if (['SEND', 'VIEW', 'EDIT'].includes(type)) {
    /**@type {string} */
    const url = intent.fileUri || intent.data;
    if (!url) return;

    if (url.startsWith('acode://')) {
      const path = url.replace('acode://', '');
      const [module, action, value] = path.split('/');

      if (module === 'plugin') {
        const { default: Plugin } = await import('pages/plugin');
        const installed = await fsOperation(PLUGIN_DIR, value).exists();
        Plugin({ id: value, installed, install: action === 'install' });
      }

      return;
    }

    await openFile(url, {
      mode: 'single',
      render: true,
    });
  }
}

HandleIntent.onError = (error) => {
  helpers.error(error);
};