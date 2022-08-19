import openFile from '../lib/openFile';
import dialogs from '../components/dialogs';
import helpers from '../utils/helpers';

export default HandleIntent;

/**
 *
 * @param {Intent} intent
 */
async function HandleIntent(intent = {}) {
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
}