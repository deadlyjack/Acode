import AppOpenAd from './app-open';
import BannerAd, { BannerAdOptions } from './banner';
import InterstitialAd from './interstitial';
import NativeAd, { NativeAdOptions } from './native';
import RewardedAd, { RewardedAdOptions, ServerSideVerificationOptions } from './rewarded';
import RewardedInterstitialAd, { RewardedInterstitialAdOptions } from './rewarded-interstitial';
import { AdMobConfig, Events, RequestConfig, TrackingAuthorizationStatus } from './shared';
export * from './api';
export { AppOpenAd, BannerAd, BannerAdOptions, InterstitialAd, NativeAd, NativeAdOptions, RewardedAd, RewardedAdOptions, RewardedInterstitialAd, RewardedInterstitialAdOptions, ServerSideVerificationOptions, };
export declare class AdMob {
    readonly AppOpenAd: typeof AppOpenAd;
    readonly BannerAd: typeof BannerAd;
    readonly InterstitialAd: typeof InterstitialAd;
    readonly NativeAd: typeof NativeAd;
    readonly RewardedAd: typeof RewardedAd;
    readonly RewardedInterstitialAd: typeof RewardedInterstitialAd;
    readonly Events: typeof Events;
    readonly TrackingAuthorizationStatus: typeof TrackingAuthorizationStatus;
    configure(config: AdMobConfig): Promise<unknown>;
    configRequest(requestConfig: RequestConfig): Promise<unknown>;
    setAppMuted(value: boolean): Promise<unknown>;
    setAppVolume(value: number): Promise<unknown>;
    start(): Promise<{
        version: string;
    }>;
    requestTrackingAuthorization(): Promise<TrackingAuthorizationStatus | false>;
}
declare global {
    const admob: AdMob;
}
export default AdMob;
