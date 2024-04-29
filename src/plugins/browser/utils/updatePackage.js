const fs = require('fs');
const path = require('path');

const configXML = path.resolve(__dirname, "../../../config.xml");
const menuJava = path.resolve(__dirname, "../../../platforms/android/app/src/main/java/com/foxdebug/browser/Menu.java");
const repeatChar = (char, times) => {
  let res = "";
  while (--times >= 0) res += char;
  return res;
};

try {
  const config = fs.readFileSync(configXML, "utf8");
  const fileData = fs.readFileSync(menuJava, "utf8");
  const appName = /widget id="([0-9a-zA-Z\.\-_]*)"/.exec(config)[1].split(".").pop();
  const newFileData = fileData.replace(/(import com\.foxdebug\.)(acode|acodefree)(.R;)/, `$1${appName}$3`);
  fs.writeFileSync(menuJava, newFileData);

  const msg = `==== Changed package to com.foxdebug.${appName} ====`;

  console.log("");
  console.log(repeatChar("=", msg.length));
  console.log(msg);
  console.log(repeatChar("=", msg.length));
  console.log("");

} catch (error) {
  console.error(error);
  process.exit(1);
}