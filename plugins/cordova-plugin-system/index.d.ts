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

interface System {
  getWebviewInfo(): Info;
  clearCache(): void;
  hideNavigation(): void;
  isPowerSaveMode(onSuccess: (res: Boolean) => void, onFail: (err: String) => void): void;
  shareFile(fileUri: String, onSuccess: () => void, onFail: (err: String) => void): void;
  shareViaWhatsapp(fileUri: String, contact: String, countryCode: String, onSuccess: () => void, onFail: (err: String) => void): void;
  sendEmail(email: String, subject: String, bodyText: String, bodyHTML: String, onSuccess: () => void, onFail: (err: String) => void): void;
  convertUriToContentSchema(fileUri: String, onSuccess: (uri: String) => void, onFail: (err: String) => void): void;
  getAppInfo(onSuccess: (info: AppInfo) => void, onFail: (err: String) => void): void;
  closeApp(onSuccess: (res: Boolean) => void, onFail: (err: String) => void): void;
}

declare var system: System;