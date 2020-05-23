import Url from "./utils/Url";
import dialogs from "../components/dialogs";
import helpers from "./utils/helpers";

const recents = {
  files: JSON.parse(localStorage.recentFiles || '[]'),
  folders: JSON.parse(localStorage.recentFolders || '[]'),
  MAX: 10,
  /**
   * 
   * @param {File} file 
   */
  addFile(file) {

    if (this.files.length >= this.MAX) this.files.pop();

    if (this.files.includes(file)) this.files.splice(this.files.indexOf(file), 1);

    this.files.unshift(file);

    localStorage.recentFiles = JSON.stringify(this.files);
  },
  addFolder(url, opts) {

    if (this.folders.length >= this.MAX) this.folders.pop();

    // if (this.folders.includes(folder)) this.folders.splice(this.folders.indexOf(folder), 1);

    this.folders = this.folders.filter(folder => {
      return url !== folder.url;
    });

    this.folders.unshift({
      url,
      opts
    });

    localStorage.recentFolders = JSON.stringify(this.folders);
  },
  /**
   * 
   * @param {Array<Array<string, any, string>>} [extra]
   * @param {"file"|"dir"|"all"} [type]
   * @param {string} [title]
   * @returns {Promise<RecentPathData>}
   */
  select(extra, type = "all", title = strings['open recent']) {
    const all = [];
    const MAX = 20;
    const shortName = name => name.length > MAX ? '...' + name.substr(-MAX - 3) : name;
    if (type === "dir" || type === "all") {
      let dirs = recents.folders;
      for (let dir of dirs) {
        const url = new URL(dir.url);
        let title = dir.url;
        if (dir.name) {
          title = dir.name;
        } else {
          if (url.hostname && url.username) title = `${url.username}@${url.hostname}`;
          if (url.hostname) title = url.protocol + url.hostname;

          title += Url.pathname(dir.url);
        }
        all.push([{
          type: 'dir',
          val: dir
        }, shortName(title), 'icon folder']);

      }
    }

    if (type === "file" || type === "all") {
      let files = recents.files;
      for (let file of files) {
        if (!file) continue;
        const name = shortName(Url.parse(file).url);
        all.push([{
          type: 'file',
          val: file
        }, name, helpers.getIconForFile(name)]);
      }
    }

    if (type === "all") all.push(['clear', strings.clear, 'icon clearclose']);

    if (extra) {
      extra = extra.map(item => {
        item[1] = shortName(item[1]);
        return item;
      });

      all.push(...extra);
    }

    return dialogs.select(title, all, {
      textTransform: false
    });
  }
};

export default recents;