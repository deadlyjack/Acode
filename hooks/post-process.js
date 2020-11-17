const path = require('path');
const fs = require('fs');

const buildFilePath = path.resolve(__dirname, '../build.json');
const copytToPath = path.resolve(__dirname, '../platforms/android/build.json');
const resPath = path.resolve(__dirname, '../platforms/android/app/src/main/res/');

const splashScreens = [
  "drawable-land-hdpi",
  "drawable-land-ldpi",
  "drawable-land-mdpi",
  "drawable-land-xhdpi",
  "drawable-land-xxhdpi",
  "drawable-land-xxxhdpi",
  "drawable-port-hdpi",
  "drawable-port-ldpi",
  "drawable-port-mdpi",
  "drawable-port-xhdpi",
  "drawable-port-xxhdpi",
  "drawable-port-xxxhdpi"
];

if (
  !fs.existsSync(copytToPath) &&
  fs.existsSync(buildFilePath)
) fs.copyFileSync(buildFilePath, copytToPath);

for (let splashScreen of splashScreens) {
  const file = path.join(resPath, splashScreen);
  if (fs.existsSync(file)) {
    fs.rmdirSync(file, {
      recursive: true
    });
    console.log("Removed: ", splashScreen);
  }
}