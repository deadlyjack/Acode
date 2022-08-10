/// <reference types="cordova-plus/types" />

declare module 'cordova/channel'

declare module 'cordova/exec'

interface Cordova {
  fireDocumentEvent(eventName: string, data: any)
}
