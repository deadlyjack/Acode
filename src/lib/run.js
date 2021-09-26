import mimeType from 'mime-types';
import marked from 'marked';
import mustache from 'mustache';
import $_console from '../views/console.hbs';
import $_markdown from '../views/markdown.hbs';
import helpers from './utils/helpers';
import dialogs from '../components/dialogs';
import git from './git';
import constants from './constants';
import fsOperation from './fileSystem/fsOperation';
import Url from './utils/Url';
import openFolder from './openFolder';

/**
 * Starts the server and run the active file in browser
 * @param {Boolean} isConsole
 * @param {"_blank"|"_system"} target
 * @param {Boolean} runFile
 */
async function run(
  isConsole = false,
  target = appSettings.value.previewMode,
  runFile = false,
) {
  if (!Acode.$runBtn.isConnected && !isConsole) return;

  if (!isConsole && !localStorage.__init_runPreview) {
    localStorage.__init_runPreview = true;

    await new Promise((resolve) => {
      dialogs.alert(strings.info.toUpperCase(), strings['preview info'], () => {
        resolve();
      });
    });
  }

  const activeFile = isConsole ? null : editorManager.activeFile;
  const uuid = helpers.uuid();

  let isLoading = false;
  let filename, pathName, extension;
  let port = constants.PORT;
  let EXECUTING_SCRIPT = uuid + '_script.js';
  const MIMETYPE_HTML = mimeType.lookup('html');
  const CONSOLE_SCRIPT = uuid + '_console.js';
  const ESPRISMA_SCRIPT = uuid + '_esprisma.js';
  const EDITOR_SCRIPT = uuid + '_editor.js';
  const CONSOLE_STYLE = uuid + '_console.css';
  const MARKDOWN_STYLE = uuid + '_md.css';
  const queue = [];

  if (activeFile) {
    filename = activeFile.filename;
    pathName = activeFile.location;
    extension = helpers.extname(filename);

    if (!pathName && activeFile.uri) {
      pathName = Url.dirname(activeFile.uri);
    }
  }

  if (runFile && extension === 'svg') {
    try {
      const fs = fsOperation(activeFile.uri);
      const res = await fs.readFile();
      const blob = new Blob([new Uint8Array(res)], {
        type: mimeType.lookup(extension),
      });

      dialogs.box(filename, `<img src='${URL.createObjectURL(blob)}'>`);
    } catch (err) {
      helpers.error(err);
    }
    return;
  }

  if (!runFile && filename !== 'index.html' && pathName) {
    const folder = openFolder.find(activeFile.uri);

    if (folder) {
      const { url } = folder;
      const fs = fsOperation(Url.join(url, 'index.html'));

      try {
        if (await fs.exists()) {
          filename = 'index.html';
          extension = 'html';
          pathName = url;
          start();
          return;
        }

        next();
      } catch (err) {
        helpers.error(err);
        return;
      }
    }
  }

  next();

  function next() {
    if (extension === 'js' || isConsole) startConsole();
    else start();
  }

  function startConsole() {
    runConsole();
    start();
  }

  function runConsole() {
    if (!isConsole) EXECUTING_SCRIPT = activeFile.filename;
    isConsole = true;
    target = '_blank';
    filename = 'console.html';
    pathName = `${ASSETS_DIRECTORY}www/`;
    port = constants.CONSOLE_PORT;
  }

  function start() {
    if (target === 'none' && extension !== 'js') {
      dialogs
        .select(strings['preview mode'], ['browser', 'in app'])
        .then((res) => {
          target = res === 'browser' ? '_system' : '_blank';
          run();
        });
    } else {
      target = target === 'browser' ? '_system' : '_blank';
      run();
    }
  }

  function run() {
    if (target === '_system') {
      system.isPowerSaveMode(
        (res) => {
          if (res)
            dialogs.alert(strings.info, strings['powersave mode warning']);
          else startServer();
        },
        () => {
          startServer();
        },
      );
    } else startServer();
  }

  function startServer() {
    webserver.stop();

    webserver.start(
      () => {
        openBrowser();
      },
      (err) => {
        if (err === 'Server already running') {
          openBrowser();
        } else {
          ++port;
          run();
        }
      },
      port,
    );

    webserver.onRequest((req) => {
      const reqId = req.requestId;
      let reqPath = req.path.substr(1);

      if (reqPath === '/') {
        reqPath = 'index.html';
      }

      const ext = helpers.extname(reqPath);
      let url = null;

      switch (reqPath) {
        case CONSOLE_SCRIPT:
          url = `${ASSETS_DIRECTORY}/js/build/${
            appSettings.console || 'console'
          }.build.js`;
          sendFileContent(url, reqId, 'application/javascript');
          break;

        case ESPRISMA_SCRIPT:
          url = `${ASSETS_DIRECTORY}/js/esprisma.js`;
          sendFileContent(url, reqId, 'application/javascript');
          break;

        case EDITOR_SCRIPT:
          sendText('', reqId, 'application/javascript');
          break;

        case EXECUTING_SCRIPT:
          let text;
          if (extension === 'js') text = activeFile.session.getValue();
          else text = '';
          sendText(text, reqId, 'application/javascript');
          break;

        case CONSOLE_STYLE:
          url = `${ASSETS_DIRECTORY}/css/console.css`;
          sendFileContent(url, reqId, 'text/css');
          break;

        case MARKDOWN_STYLE:
          url = appSettings.value.markdownStyle;
          if (url) sendFileContent(url, reqId, 'text/css');
          else sendText('img {max-width: 100%;}', reqId, 'text/css');
          break;

        default:
          sendByExt();
          break;
      }

      async function sendByExt() {
        if (isConsole) {
          if (reqPath === 'console.html') {
            sendText(
              mustache.render($_console, {
                CONSOLE_SCRIPT,
                CONSOLE_STYLE,
                ESPRISMA_SCRIPT,
                EXECUTING_SCRIPT,
                EDITOR_SCRIPT,
              }),
              reqId,
              MIMETYPE_HTML,
            );
            return;
          }

          if (reqPath === 'favicon.ico') {
            sendIco(ASSETS_DIRECTORY, reqId);
            return;
          }
        }

        if (activeFile.mode === 'single') {
          if (filename === reqPath) {
            sendText(
              activeFile.session.getValue(),
              reqId,
              mimeType.lookup(filename),
            );
          } else {
            error(reqId);
          }
          return;
        }

        let url = activeFile.uri;
        let file = null;

        if (pathName) {
          url = Url.join(pathName, reqPath);
          file = editorManager.getFile(url, 'uri');
        } else if (activeFile.type === 'git') {
          file = activeFile;
        }

        switch (ext) {
          case 'htm':
          case 'html':
            if (file) {
              sendHTML(file.session.getValue(), reqId);
            } else {
              sendFileContent(url, reqId, MIMETYPE_HTML);
            }
            break;

          case 'md':
            if (file) {
              const html = marked(file.session.getValue());
              const doc = mustache.render($_markdown, {
                html,
                filename,
                MARKDOWN_STYLE,
              });
              sendText(doc, reqId, MIMETYPE_HTML);
            }
            break;

          default:
            if (file && file.type === 'git') {
              try {
                const gitFile = await git.getGitFile(file.record, reqPath);
                const data = helpers.b64toBlob(
                  gitFile,
                  mimeType.lookup(reqPath),
                );

                const id = file.record.sha + encodeURIComponent(reqPath);
                const cacheFile = id.hashCode() + '.' + ext;
                const uri = Url.join(CACHE_STORAGE, cacheFile);
                const cacheDirFs = fsOperation(CACHE_STORAGE);
                const cacheFileFs = fsOperation(uri);

                if (await cacheFileFs.exists()) {
                  sendFile(uri, reqId);
                  break;
                }

                await cacheDirFs.createFile(cacheFile);
                await cacheFileFs.writeFile(data);

                sendFile(uri, reqId);
              } catch (err) {
                if (reqPath === 'favicon.ico') {
                  sendIco(ASSETS_DIRECTORY, reqId);
                } else {
                  error(reqId);
                }
              }
            } else {
              if (file && file.isUnsaved) {
                sendText(
                  file.session.getValue(),
                  reqId,
                  mimeType.lookup(file.filename),
                );
              } else if (url) {
                sendFile(url, reqId);
              } else {
                error(reqId);
              }
            }
            break;
        }
      }
    });
  }

  function error(id) {
    webserver.sendResponse(id, {
      status: 404,
      body: 'File not found!',
    });
  }

  function sendIco(assets, reqId) {
    const ico = Url.join(assets, 'res/logo/favicon.ico');
    sendFile(ico, reqId);
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

  async function sendFile(path, id) {
    if (isLoading) {
      queue.push(() => {
        sendFile(path, id);
      });
      return;
    }
    const protocol = Url.getProtocol(path);
    const ext = Url.extname(path);
    const mimetype = mimeType.lookup(ext);
    if (/s?ftp:/.test(protocol)) {
      const cacheFile = Url.join(
        CACHE_STORAGE,
        protocol.slice(0, -1) + path.hashCode(),
      );
      isLoading = true;
      const fs = fsOperation(path);
      try {
        await fs.readFile(); // Because reading the remote file will create cache file
        send(cacheFile, mimetype); // send the created file here
      } catch (err) {
        error(id);
      }

      isLoading = false;
      const action = queue.splice(-1, 1)[0];
      if (typeof action === 'function') action();
    } else if (protocol === 'content:') {
      sdcard.formatUri(
        path,
        (uri) => {
          send(uri, mimetype);
        },
        () => {
          error(id);
        },
      );
    } else {
      send(path, mimetype);
    }

    function send(path, mimetype) {
      webserver.sendResponse(id, {
        status: 200,
        path,
        headers: {
          'Content-Type': mimetype,
        },
      });
    }
  }

  async function sendFileContent(url, id, mime, processText) {
    const fs = fsOperation(url);

    if (!(await fs.exists())) {
      error(id);
      return;
    }

    let text = await fs.readFile('utf-8');
    text = processText ? processText(text) : text;
    if (mime === MIMETYPE_HTML) {
      sendHTML(text, id);
    } else {
      sendText(text, id, mime);
    }
  }

  function sendText(text, id, mimeType, processText) {
    webserver.sendResponse(id, {
      status: 200,
      body: processText ? processText(text) : text,
      headers: {
        'Content-Type': mimeType || 'text/html',
      },
    });
  }

  function openBrowser() {
    const theme = appSettings.value.appTheme;
    const themeData = constants.appThemeList[theme];
    const themeColor = themeData.primary.toUpperCase();
    const color =
      themeData.type === 'dark' || theme === 'default' ? '#ffffff' : '#313131';
    const options = `background=${isConsole ? '#313131' : '#ffffff'},location=${
      isConsole ? 'no' : 'yes'
    },hideurlbar=yes,cleardata=yes,clearsessioncache=yes,hardwareback=yes,clearcache=yes,toolbarcolor=${themeColor},navigationbuttoncolor=${color},closebuttoncolor=${color},clearsessioncache=yes,zoom=no`;
    cordova.InAppBrowser.open(
      `http://localhost:${port}/` + filename,
      target,
      options,
    );
  }
}

run.checkRunnable = async function () {
  try {
    const activeFile = editorManager.activeFile;
    if (activeFile.type === 'regular') {
      const folder = openFolder.find(activeFile.uri);
      if (folder) {
        const url = Url.join(folder.url, 'index.html');
        const fs = fsOperation(url);
        if (await fs.exists()) {
          return url;
        }
      }
    }

    const runnableFile = /\.((html?)|(md)|(js)|(svg))$/;
    const filename = activeFile.filename;
    if (runnableFile.test(filename)) return filename;

    return null;
  } catch (err) {
    if (err instanceof Error) throw error;
    else throw new Error(err);
  }
};

run.runFile = () => {
  run(undefined, undefined, true);
};

export default run;
