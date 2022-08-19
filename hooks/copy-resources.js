/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

const localResPath = path.resolve(__dirname, '../res/');
const androidResPath = path.resolve(localResPath, 'android/');

const copyDirRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyDirRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

copyDirRecursiveSync(androidResPath, path.resolve(__dirname, '../platforms/android/app/src/main/res/'));
