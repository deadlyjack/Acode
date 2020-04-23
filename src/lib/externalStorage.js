export default {
  get: uuid => {
    const info = JSON.parse(localStorage.externalStorageInfo || "{}");
    return info[uuid];
  },
  savePath: (uuid, path) => {
    const info = JSON.parse(localStorage.externalStorageInfo || "{}");
    if (!info[uuid]) info[uuid] = {};
    info[uuid].path = path;
    localStorage.externalStorageInfo = JSON.stringify(info);
  },
  saveOrigin: (uuid, origin) => {
    const info = JSON.parse(localStorage.externalStorageInfo || "{}");
    if (!info[uuid]) info[uuid] = {};
    info[uuid].origin = origin;
    localStorage.externalStorageInfo = JSON.stringify(info);
  },
  saveName: (uuid, name) => {
    const info = JSON.parse(localStorage.externalStorageInfo || "{}");
    if (!info[uuid]) info[uuid] = {};
    info[uuid].name = name;
    localStorage.externalStorageInfo = JSON.stringify(info);
  }
};