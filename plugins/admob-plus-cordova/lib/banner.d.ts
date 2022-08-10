import { AdSizeType, MobileAd, MobileAdOptions } from './shared';
declare type Position = 'top' | 'bottom';
declare type BannerSize = AdSizeType | {
    width: number;
    height: number;
} | {
    adaptive: 'anchored';
    orientation?: 'portrait' | 'landscape';
    width?: number;
} | {
    adaptive: 'inline';
    maxHeight: number;
    width?: number;
};
export interface BannerAdOptions extends MobileAdOptions {
    position?: Position;
    size?: BannerSize;
    offset?: number;
}
export default class BannerAd extends MobileAd<BannerAdOptions> {
    static cls: string;
    private _loaded;
    constructor(opts: BannerAdOptions);
    static config(opts: {
        backgroundColor?: string;
        marginTop?: number;
        marginBottom?: number;
    }): false | Promise<unknown>;
    load(): Promise<void>;
    show(): Promise<unknown>;
    hide(): Promise<unknown>;
}
export {};
