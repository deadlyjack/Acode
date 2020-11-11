const path = require('path');
const fs = require('fs');

const buildFilePath = path.resolve(__dirname, '../build.json');
const copytToPath = path.resolve(__dirname, '../platforms/android/build.json');

if (
  !fs.existsSync(copytToPath) &&
  fs.existsSync(buildFilePath)
) fs.copyFileSync(buildFilePath, copytToPath);