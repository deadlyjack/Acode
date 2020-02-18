const recents = {
  files: JSON.parse(localStorage.recentFiles || '[]'),
  folders: JSON.parse(localStorage.recentFolders || '[]'),
  MAX: 10,
  /**
   * 
   * @param {File} file 
   */
  addFile: function addFile(file) {

    if (this.files.length >= this.MAX) this.files.pop();

    if (this.files.includes(file)) this.files.splice(this.files.indexOf(file), 1);

    this.files.unshift(file);

    localStorage.recentFiles = JSON.stringify(this.files);
  },
  addFolder: function addFolder(folder) {

    if (this.folders.length >= this.MAX) this.folders.pop();

    if (this.folders.includes(folder)) this.folders.splice(this.folders.indexOf(folder), 1);
    this.folders.unshift(folder);

    localStorage.recentFolders = JSON.stringify(this.folders);
  }
};

export default recents;