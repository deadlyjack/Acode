const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

(async () => {
  const AD_APP_ID = 'ca-app-pub-5911839694379275~4255791238';
  const CONFIG_ID = /id="([a-z.]+")/;
  const HTML_ID = /<title>[a-z.]+<\/title>/;
  const ID_PAID = 'com.foxdebug.acode';
  const ID_FREE = 'com.foxdebug.acodefree';
  const arg = process.argv[2];
  const arg2 = process.argv[3];
  const platformsDir = path.resolve(__dirname, '../platforms/');
  const babelrcpath = path.resolve(__dirname, '../.babelrc');
  const configpath = path.resolve(__dirname, '../config.xml');
  const htmlpath = path.resolve(__dirname, '../www/index.html');
  const logopath = path.resolve(
    __dirname,
    '../res/icon/android/values/ic_launcher_background.xml',
  );

  const logoTextPaid = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#3a3e54</color>
</resources>`;
  const logoTextFree = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#ffffff</color>
</resources>`;

  try {
    let babelrcText = fs.readFileSync(babelrcpath, 'utf-8');
    let config = fs.readFileSync(configpath, 'utf-8');
    let html = fs.readFileSync(htmlpath, 'utf-8');
    let platforms = fs.readdirSync(platformsDir);
    let logo, id, currentId;

    currentId = /id="([a-z.]+)"/.exec(config)[1];
    babelrc = JSON.parse(babelrcText);

    if (arg === 'd') {
      babelrc.compact = false;
    } else if (arg === 'p') {
      babelrc.compact = true;
    }

    if (arg2 === 'free') {
      logo = logoTextFree;
      id = ID_FREE;
    } else {
      logo = logoTextPaid;
      id = ID_PAID;
    }

    fs.writeFileSync(babelrcpath, babelrcText, 'utf8');

    if (currentId !== id) {
      const promises = [];

      html = html.replace(HTML_ID, `<title>${id}</title>`);
      config = config.replace(CONFIG_ID, `id="${id}"`);
      babelrcText = JSON.stringify(babelrc, undefined, 2);

      fs.writeFileSync(htmlpath, html, 'utf8');
      fs.writeFileSync(logopath, logo, 'utf8');
      fs.writeFileSync(configpath, config, 'utf8');


      for (let platform of platforms) {
        if (!platform) continue;

        let version;
        if (platform === 'android') {
          version = '@9';
        }

        promises.push(
          (async () => {
            console.log(
              `|--- Reinstalling platform ${platform.toUpperCase()} ---|`,
            );

            if (id === ID_FREE) {
              const { stderr: stderr2 } = await exec(`cordova plugin add admob-plus-cordova --save --variable APP_ID_ANDROID="${AD_APP_ID}"`);
              if (stderr2) console.error(stderr2);
              else console.log('DONE! Installing admob-plus-cordova');
            } else {
              const { stderr: stderr2 } = await exec(`cordova plugin remove admob-plus-cordova --save`);
              if (stderr2) console.error(stderr2);
              else console.log('DONE! Removing admob-plus-cordova');
            }

            const { stderr } = await exec(`yarn clean ${platform} ${platform + version}`);
            if (stderr) console.error(stderr);
            else console.log('DONE! Cleaning and reinstalling platform');

          })(),
        );
      }

      await Promise.all(promises);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
