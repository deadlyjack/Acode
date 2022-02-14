import tag from 'html-tag-js';
import dialogs from '../../components/dialogs';
import helpers from '../../lib/utils/helpers';

export default {
  /**
   *
   * @param {Array} list
   * @param {String} name
   * @param {String} url
   * @param {Object} extra
   */
  pushFolder(list, name, url, extra = {}) {
    list.push({
      url: url,
      name: name,
      isDirectory: true,
      parent: true,
      type: 'dir',
      ...extra,
    });
  },
  /**
   *
   * @param {String} name
   * @returns {Promise<{name: String, uri: String, uuid: string}>}
   */
  addPath(name = '', uuid) {
    return new Promise((resolve, reject) => {
      dialogs
        .multiPrompt(strings['add path'], [
          {
            id: 'uri',
            placeholder: strings['select folder'],
            type: 'text',
            required: true,
            readOnly: true,
            onclick: function () {
              sdcard.getStorageAccessPermission(
                uuid,
                (res) => {
                  const $name = tag.get('#name');
                  if (!$name.value && res) {
                    const name = window.decodeURIComponent(res)?.split(':').pop()?.split('/').pop();
                    $name.value = name ?? '';
                  }
                  this.value = res;
                },
                (err) => {
                  helpers.error(err);
                },
              );
            },
          },
          {
            id: 'name',
            placeholder: strings['folder name'],
            type: 'text',
            required: true,
            value: name,
          },
        ], 'https://acode.foxdebug.com/faqs/224761680')
        .then((values) => {
          const { name, uri } = values;
          resolve({
            name,
            uri,
            uuid: helpers.uuid(),
          });
        });
    });
  },
};
