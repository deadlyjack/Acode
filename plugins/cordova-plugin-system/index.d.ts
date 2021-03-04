interface Info {
  versionName: string;
  packageName: string;
  versionCode: number;
}

interface System {
  getWebviewInfo(): Info;
  clearCache(): void;
  isPowerSaveMode(onSuccess: () => boolean, onFail: () => object): void;
  shareFile(fileUri: String, onSuccess: () => void, onFail: () => object): void;
  shareViaWhatsapp(fileUri: String, contact: String, countryCode: String, onSuccess: () => void, onFail: () => object): void;
  sendEmail(email: String, subject: String, bodyText: String, bodyHTML: String, onSuccess: () => void, onFail: () => object): void;
}

declare var system: System;