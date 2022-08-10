import GoogleMobileAds

class AMBAdBase: AMBCoreAd {
    func isLoaded() -> Bool {
        #if targetEnvironment(simulator)
        fatalError(AMBCoreError.notImplemented.localizedDescription)
        #else
        return false
        #endif
    }

    func load(_ ctx: AMBContext) {
        ctx.reject(AMBCoreError.notImplemented)
        #if targetEnvironment(simulator)
        fatalError(AMBCoreError.notImplemented.localizedDescription)
        #endif
    }

    func show(_ ctx: AMBContext) {
        ctx.reject(AMBCoreError.notImplemented)
        #if targetEnvironment(simulator)
        fatalError(AMBCoreError.notImplemented.localizedDescription)
        #endif
    }

    func hide(_ ctx: AMBContext) {
        ctx.reject(AMBCoreError.notImplemented)
        #if targetEnvironment(simulator)
        fatalError(AMBCoreError.notImplemented.localizedDescription)
        #endif
    }

    var plugin: AMBPlugin {
        return AMBContext.plugin
    }

    func emit(_ eventName: String) {
        self.emit(eventName, ["adId": self.id])
    }

    func emit(_ eventName: String, _ error: Error) {
        self.emit(eventName, ["message": error.localizedDescription])
    }

    func emit(_ eventName: String, _ reward: GADAdReward) {
        self.emit(eventName, [
            "reward": [
                "amount": reward.amount,
                "type": reward.type
            ]
        ])
    }

    func emit(_ eventName: String, _ adSize: GADAdSize) {
        self.emit(eventName, [
            "size": [
                "width": adSize.size.width,
                "height": adSize.size.height
            ]
        ])
    }

    func emit(_ eventName: String, _ data: [String: Any]) {
        var d: [String: Any] = ["adId": self.id]
        d.merge(data) { (current, _) in current }
        plugin.emit(eventName, data: d)
    }

    func emit(_ eventName: String, _ nativeAd: GADNativeAd) {
        plugin.emit(eventName, data: ["adId": nativeAd.hashValue])
    }
}
