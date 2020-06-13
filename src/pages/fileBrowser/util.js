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
      type: 'folder',
      ...extra
    });
  }
};