import alert from "dialogs/alert";
// import helpers from "utils/helpers";
import loader from "dialogs/loader";
import toast from "components/toast";
import confirm from "dialogs/confirm";

import { ReconnectingWebSocket } from "utils/pty";

let socketToNotify = new Map();
let NOTIFICATIONS_ID = 1000;
let notifyCount = 0;

export async function setup() {
  let { notification } = cordova.plugins;

  // Ensure Notifications Permission
  notification.local.hasPermission(granted => {
    if (!granted) {
      notification.local.requestPermission();
    }
  });

  notification.local.addActionGroup("taskManager", [
    { id: "killTask", title: "Kill Task" }
  ]);

  notification.local.on("killTask", (notification) => {
    let socket = socketToNotify.get(notification.id);
    socket?.close();
  });

  await host.initializeServer()
}

export class PtyError extends Error {
  #result;

  constructor(result) {
    super(result.error);
    this.#result = result;
  }

  get error() {
    return this.#result.error;
  }

  get errCode() {
    return this.#result.errCode;
  }

  get exitCode() {
    return this.#result.exitCode;
  }

  toString() {
    return `ExitCode: ${this.exitCode}\nError: ${this.error}`;
  }
}

export class PtyResponse {
  #result;

  constructor(result) {
    this.#result = result;
  }

  get stderr() {
    return this.#result.stderr;
  }

  get stderrLength() {
    return this.#result.stderrLength;
  }

  get stdout() {
    return this.#result.stdout;
  }

  get stdoutLength() {
    return this.#result.stdoutLength;
  }

  get exitCode() {
    return this.#result.exitCode;
  }
}

class PtyConnection extends EventTarget {
  #server;
  #socket;

  OPEN = WebSocket.OPEN;
  CLOSED = WebSocket.CLOSED;
  CLOSING = WebSocket.CLOSING;
  CONNECTING = WebSocket.CONNECTING;

  constructor(server, socket) {
    super();

    this.#server = server;
    this.#socket = socket;

    this.$spawned = false;
    this.$messageQueue = [];

    this.#socket.onopen = () => {
      this.$spawned = true;
      this.$messageQueue.map(i => this.send(i));
      this.$messageQueue = [];

      this.dispatchEvent(new Event("open"));
    };

    this.#socket.onclose = event =>
      this.dispatchEvent(
        new CloseEvent("close", {
          code: event.code,
          reason: event.reson,
          wasClean: event.wasClean
        })
      );

    this.#socket.onerror = event =>
      this.dispatchEvent(
        new ErrorEvent("error", {
          colno: event.colno,
          error: event.error,
          filename: event.filename,
          lineno: event.lineno,
          message: event.message,
          cancelable: event.cancelable
        })
      );

    this.#socket.onmessage = event => {
      this.dispatchEvent(
        new MessageEvent("message", {
          data: event.data,
          ...event
        })
      );
    };
  }

  exit() {
    return new Promise((resolve, reject) => {
      let output = "";
      this.addEventListener("message", ({data}) => {
        output = output + data;
      });
      this.addEventListener("close", () => {
        resolve(output);
      });
      this.addEventListener("error", () => {
        reject("Error occured");
      });
      if (this.state === this.CLOSED) {
        reject("Connection closed");
      }
    });
  }

  get socket() {
    return this.#socket;
  }

  send(message) {
    if (this.state !== this.OPEN) {
      console.warn("Not connected to pty-host server.");
      return this.$messageQueue.push(message);
    }

    // console.log("Sending:", message, this.state);
    this.#socket.send(message);
  }

  get state() {
    return this.#socket.readyState;
  }

  reconnect() {
    if (this.#socket instanceof ReconnectingWebSocket) {
      this.#socket.reconnect();
    } else {
      throw new Error("Reconnection not supported");
    }
  }

  kill() {
    if (this.state !== this.CLOSED) {
      this.#socket.close();
    }
    return true;
  }
}

export class PtyHost {
  #initialized;

  #serverLibraryPath;
  #serverLibrary = ["acode-pty", "acode-pty"];

  #serverSocket;
  #serverAdress;
  #serverPort = 9596;

  constructor() {
    this.#initialized = false;
  }

  async initializeServer(installServerIfUnavalable = true) {
    let response;

    try {
      response = await runCommand("whereis", [this.#serverLibrary[1]], {
        background: true
      });
    } catch (error) {
      return alert("PtyError", String(error));
    }

    let serverPath = response.stdout
      .split("\n")
      .find(s => s.includes(this.#serverLibrary[1]))
      .substring((this.#serverLibrary[1] + ": ").length);
    if (serverPath?.length) {
      this.#serverLibraryPath = serverPath;
      await this.#startServer();
      this.#initialized = true;
      toast("PtyHost: Server started");
    } else {
      toast("PtyHost: Server not found");

      if (!installServerIfUnavalable) {
        return false;
      }

      let installServer = await confirm("Install pty-host server now?");
      if (installServer) {
        await this.#installServer();
        await this.initializeServer(false);
      }
    }

    // Kill server on app exit
    window.addEventListener("unload", () => {
      fetch(`http://localhost:${this.#serverPort}/kill-server`, {
        method: "POST", body: "{}"
      });
    });
  }

  async getCommandPath(command, fallback) {
    let response;

    // try {
    response = await runCommand("whereis", [command], {
      background: true, sessionAction: 3
    });
    // } catch (error) {

    // }

    let commandPath = response.stdout
      .split("\n")
      .find(s => s.includes(command))
      .substring((command + ": ").length);
    if (commandPath?.length) {
      return commandPath;
    }

    if (typeof fallback === "undefined") {
      throw new Error("Command not found");
    } else {
      return fallback;
    }
  }

  async #installServer() {
    let installLoader = loader.create(
      "Installing pty-host server",
      `Running 'npm install -g ${this.#serverLibrary[0]}'`
    );
    installLoader.show();

    try {
      await runCommand("npm", ["install", "-g", this.#serverLibrary[0]], {
        background: false, sessionAction: 0
      });
      installLoader.setMessage("Server sucessfully installed");
    } catch (error) {
      alert("PtyError", "Server install failed. Npm not found.");
      console.error(error?.toString?.() || error);
    } finally {
      setTimeout(() => installLoader.destroy(), 2000);
    }
  }

  async #startServer() {
    let response;

    try {
      // Check if server is already active
      response = await fetch(`http://localhost:${this.#serverPort}/ping`);
      // console.log(response);
    } catch (err) {
      // console.error(err);
    }

    if (response && response.status == 200) {
      // Server already active
      return;
    }

    // await system.execute({
    //   command: "/data/data/com.termux/files/usr/bin/node",
    //   args: ["../usr/lib/node_modules/acode-pty/index.js"],
    //   background: true, sessionAction: 3
    // });

    await system.execute({
      command: this.#serverLibraryPath,
      background: true, sessionAction: 3
    });

    // Wait for server to startup
    await new Promise((resolve, reject) => {
      let interval, timeout;

      interval = setInterval(async () => {
        try {
          await fetch(`http://localhost:${this.#serverPort}/ping`);

          clearInterval(interval);
          timeout && clearTimeout(timeout);

          resolve(true);
        } catch (err) {}
      }, 1000);

      // Auto Reject after 5 seconds
      timeout = setTimeout(reject, 5000);
    });
  }

  async run(
    {
      args,
      type,
      cwd,
      env,
      command,
      autoClose,
      onmessage,
      maxRetries,
      autoReconnect,
      reconnectDelay
    } = {},
    throwErr = false
  ) {
    let response;

    if (!this.#initialized) {
      await this.initializeServer();
    }

    if (!command) {
      throw new Error("Command is required.");
    }

    try {
      response = await fetch(`http://localhost:${this.#serverPort}/new-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          command,
          args: args || [],
          type: type || "pty",
          cwd, env
        })
      });
    } catch (err) {
      console.error(err);
      if (throwErr) {
        await alert("PtyHost", "Server is unresponsive");
        throw new Error("Unresponsive server");
      }

      return await this.run(
        {
          args,
          type,
          command,
          autoClose,
          onmessage,
          maxRetries,
          autoReconnect,
          reconnectDelay
        },
        true
      );
    }

    if (response.ok) {
      let { notification } = cordova.plugins;
      let notificationId = ++NOTIFICATIONS_ID;
      let data = await response.json();
      let socket = new /*ReconnectingWebSocket*/ WebSocket(
        `ws://localhost:${this.#serverPort}/tasks/${data.taskID}`,
        null,
        {
          autoConnect: true,
          autoReconnect,
          delay: reconnectDelay,
          maxRetries
        }
      );

      onmessage &&
        socket.addEventListener("message", ({ data }) => {
          onmessage?.(data);
        });

      socketToNotify.set(notificationId, socket);

      socket.addEventListener("open", () => {
        if (notifyCount >= 0) {
          notification.local.schedule({
            id: 0,
            title: `PTY Host (${notifyCount})`,
            text: `Running Tasks`,
            foreground: true,
            group: "pty-tasks",
            groupSummary: true
          });
        }

        notification.local.schedule({
          id: notificationId,
          title: "Running",
          foreground: true,
          group: "pty-tasks",
          actionGroupId: "taskManager",
          text: `${command} ${args ? JSON.stringify(args) : ""}`
        });

        notifyCount += 1;
      });

      socket.addEventListener("close", () => {
        notification.local.cancel([notificationId]);
        notifyCount -= 1;

        if (notifyCount <= 0) {
          notification.local.cancel([0]);
        }

        // In case of server crash
        // this.#startServer();
      });

      return new PtyConnection(this, socket);
    } else {
      throw new Error(`Invalid server response: [${response.status}]`);
    }
  }

  execute(...args) {
    return runCommand(...args);
  }
}

export async function runCommand(
  command, args,
  { workDir, background, sessionAction } = {}
) {
  if (!command.startsWith("/")) {
    command = "/data/data/com.termux/files/usr/bin/" + command;
  }

  let result = await system.run({
    command,
    args: args || [],
    workDir: workDir,
    background: typeof background === "undefined" ? true : background,
    sessionAction: String(
      typeof sessionAction === "undefined" ? 3 : sessionAction
    )
  });

  if (result.error?.length) {
    throw new PtyError(result);
  }

  return new PtyResponse(result);
}

export async function execute(command, args, config) {
  if (!command.startsWith("/")) {
    command = "/data/data/com.termux/files/usr/bin/" + command;
  }

  return await system.execute({
    workDir: config?.workDir,
    command, args: args || [],
    background: false
  });
}

export const host = new PtyHost();

export default { run: runCommand, host };

system.run({
  command: "l/data/data/com.termux/files/usr/bin/ls",
  args: ["-a"], background: true, sessionAction: 3
}).then(console.log)
