const path = require('path');
const babeljs = require('@babel/core');
const glob = require('glob');
const fs = require('fs');

const aceFiles = glob.sync('./src/ace/**/*.js');

aceFiles.forEach(file => {
  const fileContent = fs.readFileSync(file, 'utf8');
  const result = babeljs.transformSync(fileContent, {
    presets: ['@babel/preset-env'],
  });
  const dest = path.resolve(__dirname, '../www/js/', file.replace('./src/', ''));

  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest));
  }

  fs.writeFile(dest, result.code, 'utf8', (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(`${file} -> ${dest}`);
  });
});