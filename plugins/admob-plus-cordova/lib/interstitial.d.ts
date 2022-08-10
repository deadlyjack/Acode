import { MobileAd, MobileAdOptions } from './shared';
export default class InterstitialAd extends MobileAd<MobileAdOptions> {
    static cls: string;
    isLoaded(): Promise<boolean>;
    load(): Promise<void>;
    show(): Promise<unknown>;
}
