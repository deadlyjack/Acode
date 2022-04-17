import openFile from '../openFile';
import dialogs from '../../components/dialogs';
import helpers from '../utils/helpers';

export default HandleIntent;

/**
 *
 * @param {Intent} intent
 */
async function HandleIntent(intent = {}) {
  const type = intent.action.split('.').slice(-1)[0];
  let timeout = null;

  if (['SEND', 'VIEW', 'EDIT'].includes(type)) {
    timeout = setTimeout(() => {
      dialogs.loader.create(strings.loading + '...');
    }, 300);

    await openFile(intent.fileUri || intent.data, {
      mode: 'single',
      render: true,
    });

    if (timeout) {
      clearTimeout(timeout);
    }
    dialogs.loader.destroy();
  }
}

HandleIntent.onError = (error) => {
  helpers.error(error);
}