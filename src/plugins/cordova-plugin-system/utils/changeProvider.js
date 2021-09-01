module.exports = {
  changeProvider(reset) {
    const fs = require('fs');
    const path = require('path');


    const androidManifest = path.resolve(__dirname, "../../../platforms/android/app/src/main/AndroidManifest.xml");
    const repeatChar = (char, times) => {
      let res = "";
      while (--times >= 0) res += char;
      return res;
    };

    try {
      const fileData = fs.readFileSync(androidManifest, "utf-8");
      const ID = reset ? "com.foxdebug" : /package="([0-9a-zA-Z\.\-_]*)"/.exec(fileData)[1];
      const newFileData = fileData.replace(
        /(android:authorities=")([0-9a-zA-Z\.\-_]*)(")/,
        `$1${reset?"com.foxdebug":ID}.provider$3`
      );
      fs.writeFileSync(androidManifest, newFileData);

      const msg = "==== Changed provider to " + ID + ".provider ====";

      console.log("");
      console.log(repeatChar("=", msg.length));
      console.log(msg);
      console.log(repeatChar("=", msg.length));
      console.log("");

    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
};