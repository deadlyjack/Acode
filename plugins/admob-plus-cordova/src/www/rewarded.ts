import { MobileAd, MobileAdOptions } from './shared'

export interface ServerSideVerificationOptions {
  customData?: string
  userId?: string
}

export interface RewardedAdOptions extends MobileAdOptions {
  serverSideVerification?: ServerSideVerificationOptions
}

export default class RewardedAd extends MobileAd<RewardedAdOptions> {
  static cls = 'RewardedAd'

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
