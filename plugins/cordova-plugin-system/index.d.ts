interface Info {
  versionName: string;
  packageName: string;
  versionCode: number;
}

interface System {
  getWebviewInfo(): Info;
  clearCache(): void;
}

declare var syste: System;