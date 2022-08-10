export { execAsync, AdSizeType, Events, NativeActions } from './generated';
/** @internal */
export declare type MobileAdOptions = {
    id?: number;
    adUnitId: string;
    contentUrl?: string;
    keywords?: string[];
    npa?: '1';
};
/** @internal */
export declare function start(): Promise<{
    version: string;
}>;
/** @internal */
export declare class MobileAd<T extends MobileAdOptions = MobileAdOptions> {
    static readonly type: string;
    private static allAds;
    private static idCounter;
    readonly id: number;
    protected readonly opts: T;
    private _created;
    private _init;
    constructor(opts: T);
    static getAdById(id: number): MobileAd<MobileAdOptions>;
    private static nextId;
    get adUnitId(): string;
    on(...args: Parameters<typeof document.addEventListener>): () => void;
    protected isLoaded(): Promise<boolean>;
    protected load(): Promise<void>;
    protected show(opts?: Record<string, any>): Promise<unknown>;
    protected hide(): Promise<unknown>;
    protected init(): Promise<void>;
}
export declare enum MaxAdContentRating {
    G = "G",
    MA = "MA",
    PG = "PG",
    T = "T",
    UNSPECIFIED = ""
}
export declare type RequestConfig = {
    maxAdContentRating?: MaxAdContentRating;
    sameAppKey?: boolean;
    tagForChildDirectedTreatment?: boolean | null;
    tagForUnderAgeOfConsent?: boolean | null;
    testDeviceIds?: string[];
};
export declare const enum Platforms {
    android = "android",
    ios = "ios"
}
export declare enum TrackingAuthorizationStatus {
    notDetermined = 0,
    restricted = 1,
    denied = 2,
    authorized = 3
}
export declare type AdMobConfig = {
    appMuted?: boolean;
    appVolume?: number;
} & RequestConfig;
