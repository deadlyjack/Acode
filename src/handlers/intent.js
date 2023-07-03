import openFile from 'lib/openFile';
import helpers from 'utils/helpers';

/**
 *
 * @param {Intent} intent
 */
export default async function HandleIntent(intent = {}) {
  const type = intent.action.split('.').slice(-1)[0];

  if (['SEND', 'VIEW', 'EDIT'].includes(type)) {
    await openFile(intent.fileUri || intent.data, {
      mode: 'single',
      render: true,
    });
  }
}

HandleIntent.onError = (error) => {
  helpers.error(error);
};