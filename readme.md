# Acode editor (Code editor for android)

This is a hybrid app using Apache Cordova. This app is published on play store. Check it out from [here](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree).

Warning, this project is not organised and it is very hard understand the project structure. I'll try to make it clear as possible.

## Project structure

- `src` (directory) contains all raw codes
- `www` (directory) contains public documents, built javascript and css files, language files and HTML files
- `utils` (directory) contains the cli tool to manipulate or add string to all languages easily

## Multi language support

To add new language, create a new file with language code for android (eg. en-us for english) in `www/lang/` direcotry.

Here are few utility tools to add, remove or search a string in all added languages.

```bash
yarn lang add
yarn lang remove
yarn lang search
yarn lang update
```

## How to build

In order to build the app you must have Nodejs, NPM and Apache Cordova installed on your device. Use Cordova CLI to build application.

First run `npm install` to install all dependencies, then run `webpack` to build src and then run `cordova build android`.

If you have installed yarn you can simply run `yarn build-run` to build the apk and run on connect android device or emulator.

## Special thanks to

- [Ace editor](https://ace.c9.io/)
- [Autosize](http://www.jacklmoore.com/autosize/)
- [Apache cordova](https://cordova.apache.org/)
- [babeljs.io](https://babeljs.io/)
- [Cordova plugin intent](https://github.com/napolitano/cordova-plugin-intent)
- [Esprima](https://esprima.org/)
- [Mustache](https://github.com/janl/mustache.js)
- [Marked](https://marked.js.org/)
- [Makrdown css](https://github.com/markdowncss)
- [Mime types](https://www.npmjs.com/package/mime-types)
- [Webpack](https://webpack.js.org/)
- [Vanilla picker](https://vanilla-picker.js.org/)
