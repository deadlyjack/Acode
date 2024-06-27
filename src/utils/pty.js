
export class ReconnectingWebSocket extends EventTarget {
    onopen;
    onclose;
    onerror;
    onmessage;
  
    constructor(
      url,
      protocols,
      {
        autoConnect = false,
        autoReconnect = false,
        delay = 1,
        autoClose = 0,
        maxRetries = 20
      } = {}
    ) {
      super();
  
      this.url = url;
      this.protocols = protocols;
      this.autoReconnect = autoReconnect || false;
      this.autoClose = autoClose || 0;
      this.delay = delay || 1; // Reconnect delay in milliseconds
      this.connection = null;
      this.eventListeners = {};
      this.sendQueue = new Array();
  
      this.$retries = 0;
      this.$closeTimeout = null;
      this.$connectTimeout = null;
      this.$maxRetries = maxRetries || 20;
  
      autoConnect && this.connect();
    }
  
    get readyState() {
      if (this.connection) {
        return this.connection.readyState;
      }
      return WebSocket.CLOSED;
    }
  
    connect(retry = true) {
      this.autoReconnect = true;
      if (this.readyState !== WebSocket.CLOSED) return;
      try {
        this.$retries += 1;
        this.connection = new WebSocket(this.url, this.protocols);
  
        this.connection.onopen = event => {
          this.dispatchEvent(new Event("open"));
          this.onopen?.(event);
  
          if (this.sendQueue.length) {
            let newQueue = [...this.sendQueue];
            this.sendQueue = [];
            newQueue.map(data => this.send(data));
          }
          this.$retries = 0;
        };
  
        this.connection.onmessage = event => {
          this.dispatchEvent(
            new MessageEvent("message", {
              data: event.data
            })
          );
          this.onmessage?.(event);
        };
  
        this.connection.onclose = event => {
          if (this.autoReconnect && this.$retries < this.$maxRetries) {
            this.$connectTimeout && clearTimeout(this.$connectTimeout);
            this.$connectTimeout = setTimeout(
              () => this.connect(), this.delay * 1000
            );
          } else {
            this.dispatchEvent(
              new CloseEvent("close", {
                reason: event.reason,
                code: event.code,
                wasClean: event.wasClean
              })
            );
            this.onclose?.(event);
          }
        };
  
        this.connection.onerror = error => {
          this.dispatchEvent(new ErrorEvent("error"));
          this.onerror?.(error);
        };
  
        if (this.autoClose && this.autoClose > 0) {
          this.$closeTimeout && clearTimeout(this.$closeTimeout);
          this.$closeTimeout = setTimeout(
            () => this.close(),
            this.autoClose * 1000
          );
        }
      } catch {
        if (retry && this.autoReconnect) {
          this.$connectTimeout && clearTimeout(this.$connectTimeout);
          this.$connectTimeout = setTimeout(
            () => this.connect(), this.delay * 1000
          );
        }
      }
    }
  
    reconnect() {
      if (this.connection && this.connection.readyState !== WebSocket.CLOSED) {
        this.connection.close();
      }
      this.connect();
    }
  
    send(data) {
      // console.log("[Sending]", data, this.connection?.readyState);
      if (this.connection) {
        if (this.connection.readyState === WebSocket.OPEN) {
          this.connection.send(data);
        } else {
          this.sendQueue.push(data);
          console.warn("WebSocket not open. Unable to send data.");
        }
      } else {
        this.sendQueue.push(data);
        this.connect();
      }
  
      if (this.$closeTimeout) {
        clearTimeout(this.$closeTimeout);
      }
      
      if (this.autoClose && this.autoClose > 0) {
        this.$closeTimeout = setTimeout(
          () => this.close(),
          this.autoClose * 1000
        );
      }
    }
  
    close(autoReconnect = false) {
      this.autoReconnect = autoReconnect;
      if (this.connection) {
        this.connection.close();
  
        // let event = new CloseEvent("close", {
        //   reason: "Server disconnected.",
        //   code: 1000,
        //   wasClean: true
        // });
        // this.dispatchEvent(event);
        // this.onclose?.(event);
        this.connection = null;
      }
    }
  }
  
  export function formatUrl(path, formatTermux = false) {
    if (path.startsWith("content://com.termux.documents/tree")) {
      path = path.split("::")[1];
      if (formatTermux) {
        path = path.replace(/^\/data\/data\/com\.termux\/files\/home/, "$HOME");
      }
      return path;
    } else if (path.startsWith("file:///storage/emulated/0/")) {
      let sdcardPath =
        "/sdcard" +
        path
          .substr("file:///storage/emulated/0".length)
          .replace(/\.[^/.]+$/, "")
          .split("/")
          .join("/") +
        "/";
      return sdcardPath;
    } else if (
      path.startsWith(
        "content://com.android.externalstorage.documents/tree/primary"
      )
    ) {
      path = path.split("::primary:")[1];
      let androidPath = "/sdcard/" + path;
      return androidPath;
    } else {
      return;
    }
  }
  
  export function unFormatUrl(fileUrl) {
    if (!(fileUrl.startsWith("file:///") || fileUrl.startsWith("/"))) {
      return fileUrl;
    }
  
    // Remove the "file:///" and "/" prefix
    let path = fileUrl.replace(/^file:\/\//, "").slice(1);
    path = path.replace("storage/emulated/0", "sdcard");
  
    if (
      path.startsWith("$HOME") ||
      path.startsWith("data/data/com.termux/files/home")
    ) {
      let termuxPrefix =
        "content://com.termux.documents/tree/%2Fdata%2Fdata%2Fcom.termux%2Ffiles%2Fhome::/data/data/com.termux/files/home";
  
      // Remove $HOME or termux default home path and merge the rest
      let termuxPath = path.startsWith("$HOME")
        ? path.substr("$HOME".length)
        : path.substr("data/data/com.termux/files/home".length);
      return termuxPrefix + termuxPath;
    } else if (path.startsWith("sdcard")) {
      let sdcardPrefix =
        "content://com.android.externalstorage.documents/tree/primary%3A";
      let relPath = path.substr("sdcard/".length);
  
      let sourcesList = JSON.parse(localStorage.storageList || "[]");
      for (let source of sourcesList) {
        if (source.uri.startsWith(sdcardPrefix)) {
          let raw = decodeURIComponent(source.uri.substr(sdcardPrefix.length));
          if (relPath.startsWith(raw)) {
            return source.uri + "::primary:" + relPath;
          }
        }
      }
  
      // Extract the folder name after sdcard
      let folderName = relPath.split("/")[0];
      // Add the folder name and merge the rest
      let sdcardPath =
        sdcardPrefix + folderName + "::primary:" + path.substr("sdcard/".length);
      return sdcardPath;
    } else {
      return fileUrl;
    }
  }