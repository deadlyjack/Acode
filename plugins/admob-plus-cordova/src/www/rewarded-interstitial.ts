import { RewardedAdOptions } from './rewarded'
import { MobileAd } from './shared'

export interface RewardedInterstitialAdOptions extends RewardedAdOptions {}

export default class RewardedInterstitialAd extends MobileAd<RewardedInterstitialAdOptions> {
  static cls = 'RewardedInterstitialAd'

  public isLoaded() {
    return super.isLoaded()
  }

  public load() {
    return super.load()
  }

  public show() {
    return super.show()
  }
}
