import mimeType from 'mime-types';
import marked from 'marked';
import mustache from 'mustache';
import $_console from '../views/console.hbs';
import $_markdown from '../views/markdown.hbs';
import fs from './utils/internalFs';
import helpers from './helpers';
import dialogs from '../components/dialogs';
import git from './git';
import PHP from './php';
import constants from '../constants';
import externalFs from './utils/externalFs';

/**
 * Starts the server and run the active file in browser
 * @param {Boolean} isConsole 
 * @param {"_blank"|"_system"} target 
 */
function runPreview(isConsole = false, target = appSettings.value.previewMode) {
  const activeFile = isConsole ? null : editorManager.activeFile;
  const uuid = helpers.uuid();

  let filename, path, extension;
  let port = constants.PORT;
  let useExternalFs = false;
  let relPath = null;
  let rootPath = null;
  let EXECUTING_SCRIPT = uuid + '_script.js';
  const MIMETYPE_HTML = mimeType.lookup('html');
  const decoder = new TextDecoder('utf-8');
  const CONSOLE_SCRIPT = uuid + '_console.js';
  const ESPRISMA_SCRIPT = uuid + '_esprisma.js';
  const CODEFLASK_SCRIPT = uuid + '_codeflask.js';
  const CONSOLE_STYLE = uuid + '_console.css';
  const MARKDOWN_STYLE = uuid + '_md.css';
  const DOC_PROVIDER = "content://com.android.externalstorage.documents/document/";

  if (activeFile) {
    filename = activeFile.filename;
    path = activeFile.location;
    extension = helpers.getExt(filename);

    if (!activeFile.fileUri && activeFile.contentUri) {

      if (helpers.isParent(DOC_PROVIDER, activeFile.contentUri)) {
        const [uuid, docpath] = decodeURIComponent(activeFile.contentUri.split('/').pop()).split(':');

        if (uuid === 'primary') {
          path = helpers.getPath(cordova.file.externalRootDirectory + docpath);
        } else {
          relPath = helpers.getPath(docpath);
          useExternalFs = uuid;
        }
      }

    }
  }

  if (extension === 'php') {
    if (!window.phpwarning) {
      dialogs.alert(strings.warning, strings.phpwarning, () => {
        start();
      });
      window.phpwarning = true;
    } else {
      start();
    }
  } else if (extension === 'js' && path) {
    for (let folderpath in addedFolder) {
      if (new RegExp("^" + encodeURI(path)).test(folderpath)) {
        window.resolveLocalFileSystemURL(path + 'index.html', onsuccess, onerror);
        return;
      }
    }
    onerror();
  } else {

    if (extension === 'js' || isConsole) {
      runConsole();
    }

    start();
  }

  function onsuccess() {
    dialogs.select('', [
      ['js', filename],
      ['html', 'index.html']
    ]).then(res => {
      if (res === 'js') {
        onerror();
      } else {
        filename = 'index.html';
        extension = 'html';
        start();
      }
    });
  }

  function onerror() {
    runConsole();
    start();
  }

  function runConsole() {
    if (!isConsole)
      EXECUTING_SCRIPT = activeFile.filename;
    isConsole = true;
    target = '_blank';
    filename = 'console.html';
    path = `${cordova.file.applicationDirectory}www/`;
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
      const ext = helpers.getExt(reqPath);
      let url = null;

      switch (reqPath) {
        case CONSOLE_SCRIPT:
          url = `${assets}/js/injection.build.js`;
          sendFileContent(url, req.requestId, 'application/javascript');
          break;

        case ESPRISMA_SCRIPT:
          url = `${assets}/js/esprisma.js`;
          sendFileContent(url, req.requestId, 'application/javascript');
          break;

        case CODEFLASK_SCRIPT:
          url = `${assets}/js/codeflask.min.js`;
          sendFileContent(url, req.requestId, 'application/javascript');
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
          url = `${assets}/css/md.css`;
          sendFileContent(url, req.requestId, 'text/css');
          break;

        default:
          sendAccToExt();
          break;
      }

      function sendAccToExt() {
        switch (ext) {
          case 'php':
            if (checkFile(reqPath)) { //is active file, unsaved or git
              const text = new PHP(activeFile.session.getValue(), {
                path
              }).vm.OUTPUT_BUFFER;
              sendHTML(text, req.requestId);
            } else {
              const url = path + reqPath;
              sendFileContent(url.replace('file://', ''), req.requestId, MIMETYPE_HTML, text => {
                return new PHP(text, {
                  path
                }).vm.OUTPUT_BUFFER;
              });
            }
            break;

          case 'html':
            if (isConsole) {
              const doc = mustache.render($_console, {
                CONSOLE_SCRIPT,
                CONSOLE_STYLE,
                ESPRISMA_SCRIPT,
                EXECUTING_SCRIPT,
                CODEFLASK_SCRIPT
              });
              sendText(doc, req.requestId, MIMETYPE_HTML);
            } else if (checkFile(reqPath)) {
              sendHTML(activeFile.session.getValue(), req.requestId);
            } else {
              sendFileContent(path + reqPath, req.requestId, MIMETYPE_HTML);
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
              const uri = CACHE_STORAGE + activeFile.record.sha + encodeURIComponent(reqPath) + '.' + ext;

              window.resolveLocalFileSystemURL(uri, () => {
                sendFile(uri.replace('file://', ''), req.requestId);
              }, err => {
                if (err.code === 1) {
                  git.getGitFile(activeFile.record, reqPath)
                    .then(res => {
                      const data = helpers.b64toBlob(res, mimeType.lookup(reqPath));
                      fs.writeFile(uri, data, true, false)
                        .then(() => {
                          sendFile(uri.replace('file://', ''), req.requestId);
                        })
                        .catch(err => {
                          if (err.code) dialogs.alert(strings.error, helpers.getErrorMessage(err.code));
                          console.log(err);
                        });
                    })
                    .catch(err => {
                      console.log(err);
                      error(req.requestId);
                    });
                } else {
                  error(req.requestId);
                }
              });
            } else {
              if (path) {
                const url = path + reqPath;
                const file = editorManager.getFile(url, "fileUri");
                if (file && file.isUnsaved) {
                  sendText(file.session.getValue(), req.requestId, mimeType.lookup(file.filename));
                } else {
                  sendFile(url, req.requestId);
                }
              } else if (useExternalFs) {
                if (!rootPath) {
                  const storage = externalStorage.get(useExternalFs);
                  if (storage) {
                    rootPath = storage.path;
                    sendExternalFile(reqPath, req.requestId);
                  } else {
                    externalFs.getPath(useExternalFs)
                      .then(res => {
                        externalStorage.savePath(useExternalFs, res);
                        rootPath = res;
                        sendExternalFile(reqPath, req.requestId);
                      });
                  }
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
    SDcard.getPath(rootPath, relPath + file, res => {
      sendFileContent(res, id, mimeType.lookup(file));
    }, err => {
      console.log(err);
      error(id);
    });
  }

  function error(id) {
    webserver.sendResponse(id, {
      status: 404
    });
  }


  /**
   * 
   * @param {string} text 
   * @param {string} id 
   */
  function sendHTML(text, id) {
    const js = `<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script src="${CONSOLE_SCRIPT}"></script>
<script src="${ESPRISMA_SCRIPT}"></script>
<script src="${CODEFLASK_SCRIPT}"></script>
<link rel="stylesheet" href="${CONSOLE_STYLE}">`;
    text = text.replace(/><\/script>/g, 'crossorigin="anonymous"></script>');
    const part = text.split('<head>');
    if (part.length === 2) {
      text = `${part[0]}<head>${js}${part[1]}`;
    } else if (/<html>/i.test(text)) {
      text = text.replace('<html>', `<html><head>${js}</head>`);
    } else {
      text = `<head>${js}</head>` + text;
    }

    sendText(text, id);
  }

  function sendFile(path, id) {
    path = path.replace(/^file:\/\//, '');
    const type = mimeType.lookup(path);
    webserver.sendResponse(id, {
      status: 200,
      path,
      headers: {}
    });
  }

  function sendFileContent(url, id, mime, processText) {
    fs.readFile(url)
      .then(res => {
        let text = decoder.decode(res.data);
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

    let count = parseInt(localStorage.count);
    if (count < constants.RATING_TIME) {
      localStorage.count = ++count;
    }

    const theme = appSettings.value.appTheme;
    const themeColor = theme === 'default' ? '#9999ff' : theme === 'dark' ? '#313131' : '#ffffff';
    const color = theme === 'light' ? '#9999ff' : '#ffffff';
    const options = `background=${isConsole?'#313131':'#ffffff'},location=${isConsole?'no':'yes'},hideurlbar=yes,cleardata=yes,clearsessioncache=yes,hardwareback=yes,clearcache=yes,toolbarcolor=${themeColor},navigationbuttoncolor=${color},closebuttoncolor=${color},clearsessioncache=yes,zoom=no`;
    cordova.InAppBrowser.open(`http://localhost:${port}/` + filename, target, options);

  }

  function checkFile(reqPath) {
    if (!activeFile) return false;
    return (reqPath === filename) && (activeFile.isUnsaved || !activeFile.location || activeFile.type === 'git');
  }
}

export default runPreview;