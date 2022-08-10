import Foundation
import UIKit
import GoogleMobileAds

enum AMBCoreError: Error {
    case notImplemented
    case unknown
}

protocol AMBHelperAdapter {
}

extension AMBHelperAdapter {
}

class AMBHelper {
    static let window = UIApplication.shared.keyWindow!

    static var topAnchor: NSLayoutYAxisAnchor {
        if #available(iOS 11.0, *) {
            return window.safeAreaLayoutGuide.topAnchor
        } else {
            return window.topAnchor
        }
    }

    static var bottomAnchor: NSLayoutYAxisAnchor {
        if #available(iOS 11.0, *) {
            return window.safeAreaLayoutGuide.bottomAnchor
        } else {
            return window.bottomAnchor
        }
    }

    static var frame: CGRect {
        if #available(iOS 11.0, *) {
            return window.frame.inset(by: window.safeAreaInsets)
        } else {
            return window.frame
        }
    }

    let adapter: AMBHelperAdapter

    init(_ adapter: AMBHelperAdapter) {
        self.adapter = adapter
    }
}

protocol AMBCoreContext {
    func has(_ name: String) -> Bool
    func optBool(_ name: String) -> Bool?
    func optFloat(_ name: String) -> Float?
    func optInt(_ name: String) -> Int?
    func optString(_ name: String, _ defaultValue: String) -> String
    func optStringArray(_ name: String) -> [String]?

    func resolve(_ data: [String: Any])
    func resolve(_ data: Bool)

    func reject(_ msg: String)
}

extension AMBCoreContext {
    func optString(_ name: String) -> String? {
        if has(name) {
            return optString(name, "")
        }
        return nil
    }

    func optAppMuted() -> Bool? {
        return optBool("appMuted")
    }

    func optAppVolume() -> Float? {
        return optFloat("appVolume")
    }

    func optId() -> Int? {
        return optInt("id")
    }

    func optPosition() -> String {
        return optString("position", "bottom")
    }

    func optAdUnitID() -> String? {
        return optString("adUnitId")
    }

    func optAd() -> AMBCoreAd? {
        guard let id = optId(),
              let ad = AMBCoreAd.ads[id]
        else {
            return nil
        }
        return ad
    }

    func optAdOrError() -> AMBCoreAd? {
        if let ad = optAd() {
            return ad
        } else {
            reject("Ad not found: \(optId() ?? -1)")
            return nil
        }
    }

    func optMaxAdContentRating() -> GADMaxAdContentRating? {
        switch optString("maxAdContentRating") {
        case "G":
            return GADMaxAdContentRating.general
        case "MA":
            return GADMaxAdContentRating.matureAudience
        case "PG":
            return GADMaxAdContentRating.parentalGuidance
        case "T":
            return GADMaxAdContentRating.teen
        default:
            return nil
        }
    }

    func optChildDirectedTreatmentTag() -> Bool? {
        return optBool("tagForChildDirectedTreatment")
    }

    func optUnderAgeOfConsentTag() -> Bool? {
        return optBool("tagForUnderAgeOfConsent")
    }

    func optTestDeviceIds() -> [String]? {
        return optStringArray("testDeviceIds")
    }

    func optGADRequest() -> GADRequest {
        let request = GADRequest()
        if let contentURL = optString("contentUrl") {
            request.contentURL = contentURL
        }
        if let keywords = optStringArray("keywords") {
            request.keywords = keywords
        }
        let extras = GADExtras()
        if let npa = optString("npa") {
            extras.additionalParameters = ["npa": npa]
        }
        request.register(extras)
        return request
    }

    func resolve() {
        resolve([:])
    }

    func resolve(_ data: Bool) {
        resolve(["value": data])
    }

    func reject() {
        return reject(AMBCoreError.unknown)
    }

    func reject(_ error: Error) {
        reject(error.localizedDescription)
    }

    func configure() {
        if let muted = optAppMuted() {
            GADMobileAds.sharedInstance().applicationMuted = muted
        }
        if let volume = optAppVolume() {
            GADMobileAds.sharedInstance().applicationVolume = volume
        }

        let requestConfiguration = GADMobileAds.sharedInstance().requestConfiguration
        if let maxAdContentRating = optMaxAdContentRating() {
            requestConfiguration.maxAdContentRating = maxAdContentRating
        }
        if let tag = optChildDirectedTreatmentTag() {
            requestConfiguration.tag(forChildDirectedTreatment: tag)
        }
        if let tag = optUnderAgeOfConsentTag() {
            requestConfiguration.tagForUnderAge(ofConsent: tag)
        }
        if let testDevices = optTestDeviceIds() {
            requestConfiguration.testDeviceIdentifiers = testDevices
        }
        if let sameAppKey = optBool("sameAppKey") {
            requestConfiguration.setSameAppKeyEnabled(sameAppKey)
        }

        resolve()
    }
}

class AMBCoreAd: NSObject {
    static var ads = [Int: AMBCoreAd]()

    let id: Int
    let adUnitId: String
    let adRequest: GADRequest

    init(id: Int, adUnitId: String, adRequest: GADRequest) {
        self.id = id
        self.adUnitId = adUnitId
        self.adRequest = adRequest

        super.init()

        AMBCoreAd.ads[id] = self
    }

    convenience init?(_ ctx: AMBCoreContext) {
        guard let id = ctx.optId(),
              let adUnitId = ctx.optAdUnitID()
        else {
            return nil
        }
        self.init(id: id, adUnitId: adUnitId, adRequest: ctx.optGADRequest())
    }

    deinit {
        let key = self.id
        DispatchQueue.main.async {
            AMBCoreAd.ads.removeValue(forKey: key)
        }
    }
}

class AMBBannerPlaceholder: UIView {}
