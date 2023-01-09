# Acode editor (Code editor for android)

<p style='text-align:center;'>
     <img src='res/logo_1.png' width='250'>
</p>

Acode is a lightweight but powerful code editor for Android phones. You can use this editor for editing HTML, CSS, JavaScript, text files etc.

You can create a website, run the website in the browser and see errors or logs in the console.
Also edit any kind of source file like python, CSS, HTML, Java, JavaScript, Dart, etc.

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en-play-badge.png"
     alt="Get it on Google Play"
     height="80">](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree)

## Project structure

<pre>
Acode/
|
|- src/   - contains all the raw code
|
|- www/   - contains public documents, built JavaScript and CSS files, language files, and HTML files
|
|- utils/ - contains the CLI tools for building the package, manipulating/adding strings to all languages etc.
</pre>

## Multi-language support

To add new language, create a new file with language code for android (eg. en-us for english) in [`src/lang/`](https://github.com/deadlyjack/Acode/tree/main/src/lang) directory. After adding new laguage also add it to [`src/lib/lang.js`](https://github.com/deadlyjack/Acode/blob/main/src/lib/lang.js).

Here are few utility tools to add, remove or search a string in all added languages.

```shell
yarn lang add
yarn lang remove
yarn lang search
yarn lang update
```

## How to build

To build the APK you need Nodejs, NPM, and Apache Cordova installed on your device. Use Cordova CLI to build the application.

Run this command to do the initial setup of the project. It's required just once.

```shell
yarn setup
```

Build the project

```shell
yarn build <platform (android)> <free|paid> <p|prod|d|dev>
```

## Develop plugin for Acode

Please see this [repository](https://github.com/deadlyjack/acode-plugin) for documentation.
