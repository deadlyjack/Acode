import { MobileAd, MobileAdOptions } from './shared'

enum AppOpenAdOrientation {
  Portrait = 1,
  PortraitUpsideDown = 2,
  LandscapeRight = 3,
  LandscapeLeft = 4,
}

export default class AppOpenAd extends MobileAd<
  MobileAdOptions & { orientation: AppOpenAdOrientation }
> {
  static cls = 'AppOpenAd'
  static readonly Orientation = AppOpenAdOrientation

  public isLoaded() {
    return super.isLoaded()
  }

  public load() {
    return super.load()
  }

  async show() {
    return super.show() as Promise<boolean>
  }
}
