import openFile from '../openFile';
import dialogs from '../../components/dialogs';

export default HandleIntent;

/**
 *
 * @param {object} intent
 * @param {string} intent.type
 * @param {ClipItems[]} intent.clipItems
 * @param {string} intent.data
 * @param {string} intent.action
 * @param {string} [intent.fileUri]
 * @param {string} [intent.error]
 * @param {string} [intent.filename]
 * @param {object} [intent.extras]
 */
async function HandleIntent(intent = {}) {
  const type = intent.action.split('.').slice(-1)[0];
  let timeout = null;

  timeout = setTimeout(() => {
    dialogs.loader.create(strings.loading + '...');
  }, 300);

  if (['SEND', 'VIEW', 'EDIT'].includes(type)) {
    await openFile(intent.fileUri || intent.data, {
      render: true,
    });
    return stopLoading();
  } else {
    stopLoading();
  }
  function stopLoading() {
    if (timeout) {
      clearTimeout(timeout);
    }
    dialogs.loader.destroy();
  }
}
