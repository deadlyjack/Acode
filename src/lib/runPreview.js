import mimeType from 'mime-types';
import marked from 'marked';
import mustache from 'mustache';
import $_console from '../views/console.hbs';
import $_markdown from '../views/markdown.hbs';
import fs from './fileSystem/internalFs';
import helpers from './utils/helpers';
import dialogs from '../components/dialogs';
import git from './git';
import constants from './constants';
import externalFs from './fileSystem/externalFs';
import fsOperation from './fileSystem/fsOperation';
import path from './utils/Path';
import Url from './utils/Url';

/**
 * Starts the server and run the active file in browser
 * @param {Boolean} isConsole 
 * @param {"_blank"|"_system"} target 
 */
function runPreview(isConsole = false, target = appSettings.value.previewMode) {

  const activeFile = isConsole ? null : editorManager.activeFile;
  const uuid = helpers.uuid();

  let filename, pathName, extension, addedFolderUrl;
  let port = constants.PORT;
  let useExternalFs = false;
  let relPath = null;
  let rootPath = null;
  let EXECUTING_SCRIPT = uuid + '_script.js';
  const MIMETYPE_HTML = mimeType.lookup('html');
  const CONSOLE_SCRIPT = uuid + '_console.js';
  const ESPRISMA_SCRIPT = uuid + '_esprisma.js';
  const EDITOR_SCRIPT = uuid + '_editor.js';
  const CONSOLE_STYLE = uuid + '_console.css';
  const MARKDOWN_STYLE = uuid + '_md.css';

  if (activeFile) {
    filename = activeFile.filename;
    pathName = activeFile.location;
    extension = helpers.extname(filename);

    if (!pathName && activeFile.uri) {
      pathName = Url.dirname(activeFile.uri);
    }
  }

  if (extension === 'svg') {
    fsOperation(activeFile.uri)
      .then(fs => {
        return fs.readFile();
      })
      .then(res => {
        const blob = new Blob([new Uint8Array(res)], {
          type: mimeType.lookup(extension)
        });
        dialogs.box(filename, `<img src='${URL.createObjectURL(blob)}'>`);
      })
      .catch(console.error);

    return;
  }

  if (filename !== 'index.html' && pathName) {
    for (let folder of addedFolder) {
      if (path.isParent(folder.url, pathName)) {
        addedFolderUrl = folder.url;
        const url = Url.join(addedFolderUrl, 'index.html');
        fsOperation(url)
          .then(fs => {
            return fs.exists();
          })
          .then(onresult)
          .catch(onerror);
        return;
      }
    }
  }

  next();

  function next() {
    if (extension === 'js' || isConsole) startConsole();
    else start();
  }

  function onerror() {
    helpers.error(err);
    console.log(err);
  }
  /**
   * 
   * @param {boolean} exists 
   */
  function onresult(exists) {
    if (exists) runHTML();
    else next();
  }

  function runHTML() {
    filename = 'index.html';
    extension = 'html';
    pathName = addedFolderUrl;
    start();
  }

  function startConsole() {
    runConsole();
    start();
  }

  function runConsole() {
    if (!isConsole)
      EXECUTING_SCRIPT = activeFile.filename;
    isConsole = true;
    target = '_blank';
    filename = 'console.html';
    pathName = `${cordova.file.applicationDirectory}www/`;
    port = constants.CONSOLE_PORT;
  }

  function start() {
    if (target === 'none' && extension !== 'js') {
      dialogs.select(strings['preview mode'], ['browser', 'in app'])
        .then(res => {
          target = res === 'browser' ? '_system' : '_blank';
          run();
        });
    } else {
      target = target === 'browser' ? '_system' : '_blank';
      run();
    }
  }

  function run() {
    if (target === "_system") {
      system.isPowerSaveMode(res => {
        if (res)
          dialogs.alert(strings.info, strings["powersave mode warning"]);
        else
          _run();
      }, () => {
        _run();
      });
    } else _run();
  }


  function _run() {
    webserver.stop();

    webserver.start(() => {
      openBrowser();
    }, err => {
      if (err === "Server already running") {
        openBrowser();
      } else {
        ++port;
        run();
      }
    }, port);
    webserver.onRequest(req => {
      let reqPath = req.path.substr(1);

      if (reqPath === '/') {
        reqPath = 'index.html';
      }

      const assets = `${cordova.file.applicationDirectory}www`;
      const ext = helpers.extname(reqPath);
      let url = null;

      switch (reqPath) {
        case CONSOLE_SCRIPT:
          url = `${assets}/js/build/${appSettings.console || 'console'}.build.js`;
          sendFileContent(url, req.requestId, 'application/javascript');
          break;

        case ESPRISMA_SCRIPT:
          url = `${assets}/js/esprisma.js`;
          sendFileContent(url, req.requestId, 'application/javascript');
          break;

        case EDITOR_SCRIPT:
          sendText('', req.requestId, 'application/javascript');
          break;

        case EXECUTING_SCRIPT:
          let text;
          if (extension === 'js') text = activeFile.session.getValue();
          else text = '';
          sendText(text, req.requestId, 'application/javascript');
          break;

        case CONSOLE_STYLE:
          url = `${assets}/css/console.css`;
          sendFileContent(url, req.requestId, 'text/css');
          break;

        case MARKDOWN_STYLE:
          url = appSettings.value.markdownStyle;
          if (url)
            sendFileContent(url, req.requestId, 'text/css');
          else
            sendText('img {max-width: 100%;}', req.requestId, 'text/css');
          break;

        default:
          sendAccToExt();
          break;
      }

      function sendAccToExt() {
        switch (ext) {
          case 'htm':
          case 'html':
            if (isConsole) {
              const doc = mustache.render($_console, {
                CONSOLE_SCRIPT,
                CONSOLE_STYLE,
                ESPRISMA_SCRIPT,
                EXECUTING_SCRIPT,
                EDITOR_SCRIPT
              });
              sendText(doc, req.requestId, MIMETYPE_HTML);
            } else if (checkFile(reqPath)) {
              sendHTML(activeFile.session.getValue(), req.requestId);
            } else {
              const url = Url.join(pathName, reqPath);
              sendFileContent(url, req.requestId, MIMETYPE_HTML);
            }
            break;

          case 'md':
            const html = marked(activeFile.session.getValue());
            const doc = mustache.render($_markdown, {
              html,
              filename,
              MARKDOWN_STYLE
            });
            sendText(doc, req.requestId, MIMETYPE_HTML);
            break;

          default:
            if (activeFile && activeFile.type === 'git') {
              const id = activeFile.record.sha + encodeURIComponent(reqPath);
              const uri = CACHE_STORAGE + id.hashCode() + "." + ext;

              window.resolveLocalFileSystemURL(uri, () => {
                sendFile(uri, req.requestId);
              }, err => {
                if (err.code === 1) {
                  git.getGitFile(activeFile.record, reqPath)
                    .then(res => {
                      const data = helpers.b64toBlob(res, mimeType.lookup(reqPath));
                      fs.writeFile(uri, data, true, false)
                        .then(() => {
                          sendFile(uri, req.requestId);
                        })
                        .catch(err => {
                          if (err.code) dialogs.alert(strings.error, helpers.getErrorMessage(err.code));
                          console.log(err);
                        });
                    })
                    .catch(err => {
                      error(req.requestId);
                    });
                } else {
                  error(req.requestId);
                }
              });
            } else {
              if (pathName) {
                const url = Url.join(pathName, reqPath);
                const file = editorManager.getFile(url, "uri");
                if (file && file.isUnsaved) {
                  sendText(file.session.getValue(), req.requestId, mimeType.lookup(file.filename));
                } else {
                  sendFile(url, req.requestId);
                }
              } else if (useExternalFs) {
                if (!rootPath) {
                  externalFs.getPath(useExternalFs)
                    .then(res => {
                      rootPath = res;
                      sendExternalFile(reqPath, req.requestId);
                    });
                } else {
                  sendExternalFile(reqPath, req.requestId);
                }
              } else {
                error(req.requestId);
              }
            }
            break;
        }
      }
    });
  }

  function sendExternalFile(file, id) {
    sdcard.getPath(rootPath, path.join(relPath, file), res => {
      sendFileContent(res, id, mimeType.lookup(file));
    }, err => {
      console.log(err);
      error(id);
    });
  }

  function error(id) {
    webserver.sendResponse(id, {
      status: 404,
      body: "File not found!"
    });
  }


  /**
   * 
   * @param {string} text 
   * @param {string} id 
   */
  function sendHTML(text, id) {

    if (appSettings.value.showConsole) {
      const js = `<meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="/${EDITOR_SCRIPT}" crossorigin="anonymous"></script>
      <script src="/${CONSOLE_SCRIPT}" crossorigin="anonymous"></script>
      <script src="/${ESPRISMA_SCRIPT}" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="/${CONSOLE_STYLE}">`;
      text = text.replace(/><\/script>/g, ' crossorigin="anonymous"></script>');
      const part = text.split('<head>');
      if (part.length === 2) {
        text = `${part[0]}<head>${js}${part[1]}`;
      } else if (/<html>/i.test(text)) {
        text = text.replace('<html>', `<html><head>${js}</head>`);
      } else {
        text = `<head>${js}</head>` + text;
      }
    }

    sendText(text, id);
  }

  function sendFile(path, id) {
    const protocol = Url.getProtocol(path);
    const ext = Url.extname(path);
    const mimetype = mimeType.lookup(ext);
    if (protocol === "ftp:") {

      const cacheFile = CACHE_STORAGE_REMOTE + path.hashCode();
      fsOperation(path)
        .then(fs => {
          return fs.readFile();
        })
        .then(data => {
          send(cacheFile, mimetype);
        })
        .catch(err => {
          error(id);
        });

    } else if (protocol === "content:") {

      sdcard.formatUri(path, uri => {
        send(uri, mimetype);
      }, err => {
        error(id);
      });

    } else {
      send(path, mimetype);
    }

    function send(path, mimetype) {
      webserver.sendResponse(id, {
        status: 200,
        path,
        headers: {
          "Content-Type": mimetype
        }
      });
    }
  }

  function sendFileContent(url, id, mime, processText) {
    fsOperation(url)
      .then(fs => {
        return fs.readFile('utf-8');
      })
      .then(text => {
        text = processText ? processText(text) : text;
        if (mime === MIMETYPE_HTML) {
          sendHTML(text, id);
        } else {
          sendText(text, id, mime);
        }
      })
      .catch(err => {
        console.log(err);
        error(id);
      });
  }

  function sendText(text, id, mimeType, processText) {
    webserver.sendResponse(id, {
      status: 200,
      body: processText ? processText(text) : text,
      headers: {
        'Content-Type': mimeType || 'text/html'
      }
    });
  }

  function openBrowser() {
    const theme = appSettings.value.appTheme;
    const themeData = constants.appThemeList[theme];
    const themeColor = themeData.primary.toUpperCase();
    const color = (themeData.type === "dark" || theme === "default") ? "#ffffff" : "#313131";
    const options = `background=${isConsole?"#313131":'#ffffff'},location=${isConsole?'no':'yes'},hideurlbar=yes,cleardata=yes,clearsessioncache=yes,hardwareback=yes,clearcache=yes,toolbarcolor=${themeColor},navigationbuttoncolor=${color},closebuttoncolor=${color},clearsessioncache=yes,zoom=no`;
    cordova.InAppBrowser.open(`http://localhost:${port}/` + filename, target, options);
  }

  function checkFile(reqPath) {
    if (!activeFile) return false;
    return (reqPath === filename) && (activeFile.isUnsaved || !activeFile.location || activeFile.type === 'git');
  }
}


runPreview.checkRunnable = async function () {
  try {
    const activeFile = editorManager.activeFile;
    let result = null;
    if (activeFile.type === "regular") {
      for (let folder of addedFolder) {
        const folderPath = new RegExp('^' + folder.url);
        if (folderPath.test(activeFile.uri)) {
          const url = Url.join(folder.url, 'index.html');
          const fs = await fsOperation(url);
          if (await fs.exists()) {
            result = url;
            break;
          }
        }
      }
    }

    if (!result) {
      const runnableFile = /\.((html?)|(md)|(js)|(svg))$/;
      const filename = activeFile.filename;
      if (runnableFile.test(filename))
        result = filename;
    }

    return result;
  } catch (err) {
    if (err instanceof Error) throw error;
    else throw new Error(err);
  }
};

export default runPreview;