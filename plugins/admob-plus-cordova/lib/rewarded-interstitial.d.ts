import { RewardedAdOptions } from './rewarded';
import { MobileAd } from './shared';
export interface RewardedInterstitialAdOptions extends RewardedAdOptions {
}
export default class RewardedInterstitialAd extends MobileAd<RewardedInterstitialAdOptions> {
    static cls: string;
    isLoaded(): Promise<boolean>;
    load(): Promise<void>;
    show(): Promise<unknown>;
}
