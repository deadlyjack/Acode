const path = require('path');
const babeljs = require('@babel/core');
const fs = require('fs');

const aceFiles = [
  'src/lib/ace/mode-smali.js',
];

aceFiles.forEach(file => {
  file = path.resolve(__dirname, '..', file);
  const filename = path.basename(file);
  let fileContent = fs.readFileSync(file, 'utf8');
  if (!/^worker/.test(filename)) {
    console.log(`Processing ${filename}`);
    fileContent = babeljs.transformSync(fileContent, {
      minified: true,
      presets: ['@babel/preset-env'],
    }).code;
  } else {
    console.log(`Skipping ${filename}`);
  }

  const dest = path.resolve(__dirname, '..', 'www/js/ace/', filename);

  fs.writeFile(dest, fileContent, 'utf8', (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(`${file} -> ${dest}`);
  });
});