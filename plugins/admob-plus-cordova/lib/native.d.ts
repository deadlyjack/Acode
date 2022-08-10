import { MobileAd, MobileAdOptions } from './shared';
declare type ShowOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export interface NativeAdOptions extends MobileAdOptions {
    view?: string;
}
export default class NativeAd extends MobileAd<NativeAdOptions> {
    static cls: string;
    isLoaded(): Promise<boolean>;
    hide(): Promise<unknown>;
    load(): Promise<void>;
    show(opts?: ShowOptions): Promise<unknown>;
    showWith(elm: HTMLElement): Promise<void>;
}
export {};
