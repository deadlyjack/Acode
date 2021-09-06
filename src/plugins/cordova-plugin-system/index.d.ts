interface Info {
  versionName: string;
  packageName: string;
  versionCode: number;
}

interface AppInfo{
  label: String;
  packageName: String;
  versionCode: Number;
  versionName: String;
  firstInstallTime: Number;
  lastUpdateTime: Number;
}

interface ShortCut{
  id: String;
  label: String;
  description: String;
  icon: String;
  action: String;
  data: String;
}

interface System {
  /**
   * Get informartion about current webview
   */
  getWebviewInfo(onSuccess: (res: Info) => void, onFail: (err: String) => void): void;
  /**
   * Checks if power saving mode is on
   * @param onSuccess 
   * @param onFail 
   */
  isPowerSaveMode(onSuccess: (res: Boolean) => void, onFail: (err: String) => void): void;
  /**
   * Shares file using Apps content provider
   * @param fileUri File to share
   * @param onSuccess 
   * @param onFail 
   */
  shareFile(fileUri: String, onSuccess: () => void, onFail: (err: String) => void): void;
  /**
   * Gets app infomartion
   * @param onSuccess 
   * @param onFail 
   */
  getAppInfo(onSuccess: (info: AppInfo) => void, onFail: (err: String) => void): void;
  /**
   * Add shortcut to app context menu
   * @param shortCut 
   * @param onSuccess 
   * @param onFail 
   */
  addShortcut(shortCut: ShortCut, onSuccess: (res: Boolean) => void, onFail: (err: String) => void): void;
  /**
   * Removes shortcut
   * @param id 
   * @param onSuccess 
   * @param onFail 
   */
  removeShortcut(id: String, onSuccess: (res: Boolean) => void, onFail: (err: String) => void): void;
  /**
   * Pins a shortcut
   * @param id 
   * @param onSuccess 
   * @param onFail 
   */
  pinShortcut(id: String, onSuccess: (res: Boolean) => void, onFail: (err: String) => void): void;
  /**
   * Gets android version
   * @param onSuccess 
   * @param onFail 
   */
  getAndroidVersion(onSuccess: (res: Number)=>void, onFail: (err: String)=>void): void;
  /**
   * Open settings which lets user change app settings to manage all files
   * @param onSuccess 
   * @param onFail 
   */
  manageAllFiles(onSuccess: ()=>void, onFail: (err: String)=>void): void;
  /**
   * Opens settings to allow to grant the app permission manage all files on device
   * @param onSuccess 
   * @param onFail 
   */
  isExternalStorageManager(onSuccess: (res: Boolean)=>void, onFail: (err: String)=>void): void;
  /**
   * Requests user to grant the provided permissions
   * @param permissions constant value of the permision required @see https://developer.android.com/reference/android/Manifest.permission
   * @param onSuccess 
   * @param onFail 
   */
  requestPermissions(permissions: String[], onSuccess: (res: Boolean)=>void, onFail: (err: String)=>void):void;
  /**
   * Requests user to grant the provided permission
   * @param permission constant value of the permision required @see https://developer.android.com/reference/android/Manifest.permission
   * @param onSuccess 
   * @param onFail 
   */
  requestPermission(permission: String, onSuccess: (res: Boolean)=>void, onFail: (err: String)=>void):void;
  /**
   * Checks whether the app has provided permission
   * @param permission constant value of the permision required @see https://developer.android.com/reference/android/Manifest.permission
   * @param onSuccess 
   * @param onFail 
   */
  hasPermission(permission: String, onSuccess: (res: Boolean)=>void, onFail: (err: String)=>void):void;

}

declare var system: System;