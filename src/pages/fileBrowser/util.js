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
            id: 'name',
            placeholder: 'Name',
            type: 'text',
            required: true,
            value: name,
            autofocus: !name,
          },
          {
            id: 'uri',
            placeholder: 'select path',
            type: 'text',
            required: true,
            readOnly: true,
            onclick: function () {
              sdcard.getStorageAccessPermission(
                uuid,
                (res) => {
                  this.value = res;
                },
                (err) => {
                  helpers.error(err);
                },
              );
            },
          },
        ])
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
