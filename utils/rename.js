const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

(async () => {
  const platformsDir = path.resolve(__dirname, '../platforms/');
  const configpath = path.resolve(__dirname, '../config.xml');
  const APK_PATH = platformsDir + "/android/app/build/outputs/apk/debug/app-debug.apk";
  const AAB_PATH = platformsDir + "/android/app/build/outputs/bundle/release/app-release.aab";
  const ID_PAID = 'com.foxdebug.acode';
  const ID_FREE = 'com.foxdebug.acodefree';
  const CONFIG_VERSION = /<widget.* version="([1-9.]+)"/;
  const arg = process.argv[2];
  const arg2 = process.argv[3];
  
  try {
    let config = fs.readFileSync(configpath, 'utf-8');
    let platforms = fs.readdirSync(platformsDir);
    let name, id, version, build, artifact, ext, target;

    version = CONFIG_VERSION.exec(config)[1];
    
    if (arg[0] === 'd') {
      build = '_debug';
      artifact = APK_PATH;
      ext = '.apk';
    } else if (arg[0] === 'p') {
      build = '';
      artifact = AAB_PATH;
      ext = '.aab';
    }

    if (arg2 === 'free') {
      id = ID_FREE;
    } else {
      id = ID_PAID;
    }
    
    name = '../' + id + '_' + version + build + ext;
    target = path.resolve(__dirname, name);
    
    console.log(artifact + " -> " + target);
    fs.rename(artifact, target, () => {});

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
