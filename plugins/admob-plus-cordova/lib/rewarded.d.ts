import { MobileAd, MobileAdOptions } from './shared';
export interface ServerSideVerificationOptions {
    customData?: string;
    userId?: string;
}
export interface RewardedAdOptions extends MobileAdOptions {
    serverSideVerification?: ServerSideVerificationOptions;
}
export default class RewardedAd extends MobileAd<RewardedAdOptions> {
    static cls: string;
    isLoaded(): Promise<boolean>;
    load(): Promise<void>;
    show(): Promise<unknown>;
}
