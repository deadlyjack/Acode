const path = require('path');
const fs = require('fs');

const gradleFilePath = path.resolve(__dirname, '../build-extras.gradle');
const newGradleFilePath = path.resolve(
  __dirname,
  '../platforms/android/app/build-extras.gradle'
);
const buildFilePath = path.resolve(__dirname, '../build.json');
const newBuildFilePath = path.resolve(
  __dirname,
  '../platforms/android/build.json'
);

const repeatChar = (char, times) => {
  let res = '';
  while (--times >= 0) res += char;
  return res;
};

let msg;
if (!fs.existsSync(newBuildFilePath) && fs.existsSync(buildFilePath)) {
  msg = '== Moved build.json ==';
  console.log(repeatChar('=', msg.length));
  console.log(msg);
  console.log(repeatChar('=', msg.length));
  fs.copyFileSync(buildFilePath, newBuildFilePath);
}

if (!fs.existsSync(newGradleFilePath) && fs.existsSync(gradleFilePath)) {
  msg = '== Moved build-extras.gradle ==';
  console.log(repeatChar('=', msg.length));
  console.log(msg);
  console.log(repeatChar('=', msg.length));
  fs.copyFileSync(gradleFilePath, newGradleFilePath);
}
