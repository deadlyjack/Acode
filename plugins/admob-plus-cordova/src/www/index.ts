import AppOpenAd from './app-open'
import BannerAd, { BannerAdOptions } from './banner'
import InterstitialAd from './interstitial'
import NativeAd, { NativeAdOptions } from './native'
import RewardedAd, {
  RewardedAdOptions,
  ServerSideVerificationOptions,
} from './rewarded'
import RewardedInterstitialAd, {
  RewardedInterstitialAdOptions,
} from './rewarded-interstitial'
import {
  AdMobConfig,
  Events,
  execAsync,
  fireDocumentEvent,
  MobileAd,
  NativeActions,
  Platforms,
  RequestConfig,
  start,
  TrackingAuthorizationStatus,
} from './shared'

export * from './api'
export {
  AppOpenAd,
  BannerAd,
  BannerAdOptions,
  InterstitialAd,
  NativeAd,
  NativeAdOptions,
  RewardedAd,
  RewardedAdOptions,
  RewardedInterstitialAd,
  RewardedInterstitialAdOptions,
  ServerSideVerificationOptions,
}

export class AdMob {
  public readonly AppOpenAd = AppOpenAd
  public readonly BannerAd = BannerAd
  public readonly InterstitialAd = InterstitialAd
  public readonly NativeAd = NativeAd
  public readonly RewardedAd = RewardedAd
  public readonly RewardedInterstitialAd = RewardedInterstitialAd

  public readonly Events = Events
  public readonly TrackingAuthorizationStatus = TrackingAuthorizationStatus

  configure(config: AdMobConfig) {
    return execAsync(NativeActions.configure, [config])
  }

  public configRequest(requestConfig: RequestConfig) {
    return execAsync(NativeActions.configRequest, [requestConfig])
  }

  public setAppMuted(value: boolean) {
    return execAsync(NativeActions.setAppMuted, [value])
  }

  public setAppVolume(value: number) {
    return execAsync(NativeActions.setAppVolume, [value])
  }

  public start() {
    return start()
  }

  public async requestTrackingAuthorization(): Promise<
    TrackingAuthorizationStatus | false
  > {
    if (cordova.platformId === Platforms.ios) {
      const n = await execAsync(NativeActions.requestTrackingAuthorization)
      if (n !== false) {
        return TrackingAuthorizationStatus[
          TrackingAuthorizationStatus[n as number]
        ]
      }
    }
    return false
  }
}

declare global {
  const admob: AdMob
}

export default AdMob
