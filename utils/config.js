const path = require('path');
const fs = require('fs');

const arg = process.argv[2];
const arg2 = process.argv[3];
const wbcpath = path.resolve(__dirname, '../webpack.config.js');
const babelrcpath = path.resolve(__dirname, '../.babelrc');
const configpath = path.resolve(__dirname, '../config.xml');

let wbc = fs.readFileSync(wbcpath, 'utf8');
let babelrc = fs.readFileSync(babelrcpath, 'utf8');
let config = fs.readFileSync(configpath, 'utf8');
babelrc = JSON.parse(babelrc);

if (arg === 'd') {
  wbc = wbc.replace(/mode: '.*'/, "mode: 'development'");
  babelrc.compact = false;
} else if (arg === 'p') {
  wbc = wbc.replace(/mode: '.*'/, "mode: 'production'");
  babelrc.compact = true;
}

if (arg2 === 'free') {
  config = config.replace(/id="([a-z.]+")/, 'id="com.foxdebug.acodefree"');
} else {
  config = config.replace(/id="([a-z.]+")/, 'id="com.foxdebug.acode"');
}

fs.writeFileSync(configpath, config, 'utf8');
fs.writeFileSync(wbcpath, wbc, 'utf8');
babelrc = JSON.stringify(babelrc, undefined, 2);
fs.writeFileSync(babelrcpath, babelrc, 'utf8');
process.exit(0);