interface Info {
  versionName: string;
  packageName: string;
  versionCode: number;
}

interface System {
  getWebviewInfo(): Info;
  clearCache(): void;
  shareFile(fileUri: String, onSuccess: () => void, onFail: () => object): void;
}

declare var system: System;