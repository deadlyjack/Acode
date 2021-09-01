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
  data: String;
}

interface System {
  /**
   * Get informartion about current webview
   */
  getWebviewInfo(onSuccess: (res: Info) => void, onFail: (err: String) => void): void;
  /**
   * Clear app cache
   */
  clearCache(): void;
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
}

declare var system: System;