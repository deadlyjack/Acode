import { MobileAd, MobileAdOptions } from './shared'

export default class InterstitialAd extends MobileAd<MobileAdOptions> {
  static cls = 'InterstitialAd'

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
