import GoogleMobileAds

class AMBRewardedInterstitial: AMBAdBase, GADFullScreenContentDelegate {
    var mAd: GADRewardedInterstitialAd?

    deinit {
        clear()
    }

    override func isLoaded() -> Bool {
        return self.mAd != nil
    }

    override func load(_ ctx: AMBContext) {
        clear()

        GADRewardedInterstitialAd.load(withAdUnitID: adUnitId, request: adRequest, completionHandler: { ad, error in
            if error != nil {
                self.emit(AMBEvents.adLoadFail, error!)
                self.emit(AMBEvents.rewardedInterstitialLoadFail, error!)

                ctx.reject(error!)
                return
            }

            self.mAd = ad
            ad?.fullScreenContentDelegate = self
            ad?.serverSideVerificationOptions = ctx.optGADServerSideVerificationOptions()

            self.emit(AMBEvents.adLoad)
            self.emit(AMBEvents.rewardedInterstitialLoad)

            ctx.resolve()
        })
    }

    override func show(_ ctx: AMBContext) {
        mAd?.present(fromRootViewController: plugin.viewController, userDidEarnRewardHandler: {
            let reward = self.mAd!.adReward
            self.emit(AMBEvents.adReward, reward)
            self.emit(AMBEvents.rewardedInterstitialReward, reward)
        })
        ctx.resolve()
    }

    func adDidRecordImpression(_ ad: GADFullScreenPresentingAd) {
        self.emit(AMBEvents.adImpression)
        self.emit(AMBEvents.rewardedInterstitialImpression)
    }

    func ad(_ ad: GADFullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        clear()
        self.emit(AMBEvents.adShowFail, error)
        self.emit(AMBEvents.rewardedInterstitialShowFail, error)
    }

    func adDidPresentFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        self.emit(AMBEvents.adShow)
        self.emit(AMBEvents.rewardedInterstitialShow)
    }

    func adDidDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        clear()
        self.emit(AMBEvents.adDismiss)
        self.emit(AMBEvents.rewardedInterstitialDismiss)
    }

    private func clear() {
        mAd?.fullScreenContentDelegate = nil
        mAd = nil
    }
}
