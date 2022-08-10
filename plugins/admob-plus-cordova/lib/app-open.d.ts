import { MobileAd, MobileAdOptions } from './shared';
declare enum AppOpenAdOrientation {
    Portrait = 1,
    PortraitUpsideDown = 2,
    LandscapeRight = 3,
    LandscapeLeft = 4
}
export default class AppOpenAd extends MobileAd<MobileAdOptions & {
    orientation: AppOpenAdOrientation;
}> {
    static cls: string;
    static readonly Orientation: typeof AppOpenAdOrientation;
    isLoaded(): Promise<boolean>;
    load(): Promise<void>;
    show(): Promise<boolean>;
}
export {};
