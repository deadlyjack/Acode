const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const readline = require('readline');
const args = yargs.argv;

const dir = path.resolve(__dirname, '../www/lang');
const read = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const list = fs.readdirSync(dir);
let command = "";
if (args._.length > 1) {
  console.error("Invalid argments", args._);
  process.exit(0);
} else {
  command = args._[0];
}

switch (command) {
  case 'add':
  case 'remove':
  case 'update':
  case 'search':
    update();
    break;
  default:
    console.error(`Missing arguments.
use 'add' add new string 
use 'remove' remove string 
use 'search' remove string 
use 'update' update string`);
    process.exit();
}

function update() {
  let key, string;
  getStr("string: ")
    .then(res => {
      key = res.toLowerCase();
      string = res;
      askTranslation();
    });

  function askTranslation(i = 0) {
    const lang = list[i];
    const langName = lang.split('.')[0];
    if (command === "add") {
      getStr(`${langName}: `)
        .then(res => {

          res = res || string;
          update(strings => {
            if (key in strings) {
              console.error("String already exists");
              process.exit(1);
            } else {
              strings[key] = res;
              return strings;
            }
          });

        });
    } else if (command === "remove") {
      update(strings => {
        if (key in strings) {
          delete strings[key];
          return strings;
        } else {
          console.error("String not exists");
          process.exit(1);
        }
      });
    } else if (command === "update") {
      getStr(`${langName}: `)
        .then(res => {

          res = res || string;
          update(strings => {
            strings[key] = res;
            return strings;
          });

        });
    } else if (command === "search") {
      update(string => {
        if (key in string) console.log(`${key}(${langName}): ${string[key]}`);
        else {
          console.log(`${key} not exists`);
          process.exit();
        }
      });
    }

    function update(modify) {
      const file = path.resolve(dir, lang);
      const text = fs.readFileSync(file, "utf8");
      const strings = modify(JSON.parse(text));
      if (strings) {
        const newText = JSON.stringify(strings, undefined, 2);
        fs.writeFile(file, newText, "utf8", err => {
          if (err) {
            console.error(err);
            process.exit(1);
          }

          next();
        });
      } else {
        next();
      }

      function next() {
        if (i === list.length - 1) {
          process.exit();
        } else {
          askTranslation(++i);
        }
      }
    }
  }

}

function getStr(str) {
  return new Promise((resolve, reject) => {
    read.question(str, res => {
      resolve(res);
    });
  });
}