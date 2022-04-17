interface Info {
  versionName: string;
  packageName: string;
  versionCode: number;
}

interface AppInfo {
  label: String;
  packageName: String;
  versionCode: Number;
  versionName: String;
  firstInstallTime: Number;
  lastUpdateTime: Number;
}

interface ShortCut {
  id: String;
  label: String;
  description: String;
  icon: String;
  action: String;
  data: String;
}

interface Intent{
  action: string;
  data: string;
  type: string;
  package: string;
  extras: {
    [key: string]: any;
  };
}

interface System {
  /**
   * Get informartion about current webview
   */
  getWebviewInfo(
    onSuccess: (res: Info) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Checks if power saving mode is on
   * @param onSuccess
   * @param onFail
   */
  isPowerSaveMode(
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Shares file using Apps content provider
   * @param fileUri File to share
   * @param onSuccess
   * @param onFail
   */
  shareFile(
    fileUri: String,
    onSuccess: () => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Gets app infomartion
   * @param onSuccess
   * @param onFail
   */
  getAppInfo(
    onSuccess: (info: AppInfo) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Add shortcut to app context menu
   * @param shortCut
   * @param onSuccess
   * @param onFail
   */
  addShortcut(
    shortCut: ShortCut,
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Removes shortcut
   * @param id
   * @param onSuccess
   * @param onFail
   */
  removeShortcut(
    id: String,
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Pins a shortcut
   * @param id
   * @param onSuccess
   * @param onFail
   */
  pinShortcut(
    id: String,
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Gets android version
   * @param onSuccess
   * @param onFail
   */
  getAndroidVersion(
    onSuccess: (res: Number) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Open settings which lets user change app settings to manage all files
   * @param onSuccess
   * @param onFail
   */
  manageAllFiles(onSuccess: () => void, onFail: (err: String) => void): void;
  /**
   * Opens settings to allow to grant the app permission manage all files on device
   * @param onSuccess
   * @param onFail
   */
  isExternalStorageManager(
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Requests user to grant the provided permissions
   * @param permissions constant value of the permision required @see https://developer.android.com/reference/android/Manifest.permission
   * @param onSuccess
   * @param onFail
   */
  requestPermissions(
    permissions: String[],
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Requests user to grant the provided permission
   * @param permission constant value of the permision required @see https://developer.android.com/reference/android/Manifest.permission
   * @param onSuccess
   * @param onFail
   */
  requestPermission(
    permission: String,
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Checks whether the app has provided permission
   * @param permission constant value of the permision required @see https://developer.android.com/reference/android/Manifest.permission
   * @param onSuccess
   * @param onFail
   */
  hasPermission(
    permission: String,
    onSuccess: (res: Boolean) => void,
    onFail: (err: String) => void,
  ): void;
  /**
   * Opens src in browser
   * @param src
   */
  openInBrowser(src: String): void;
  /**
   * Launches and app
   * @param app 
   * @param action 
   * @param value 
   * @param onSuccess 
   * @param onfail 
   */
  launchApp(
    app: String,
    action: String,
    value: String,
    onSuccess: (arg: any) => void,
    onfail: (arg: any) => void,
  ): void;

  /**
   * Opens a link within the app
   * @param url Url to open
   * @param title Title of the page
   * @param showButtons Set to true to show buttons like console, open in browser, etc
   */
  inAppBrowser(url: string, title: string, showButtons: boolean): void;
  /**
   * Sets the color of status bar and navigation bar
   * @param theme Color of status bar and navigation bar
   * @param type Type of theme foe e.g. light or dark
   * @param onSuccess Callback on success
   * @param onFail Callback on fail
   */
  setUiTheme(theme: string, type: string, onSuccess:()=>void, onFail: (err: String)=>void): void;
  /**
   * Sets intent handler for the app
   * @param onSuccess 
   * @param onFail 
   */
  setIntentHandler(onSuccess: (intent: Intent)=>void, onFail: (err: String)=>void): void;
  /**
   * Gets the launch intent
   * @param onSuccess 
   * @param onFail 
   */
  getCordovaIntent(onSuccess: (intent: Intent)=>void, onFail: (err: String)=>void): void;
}

declare var system: System;
