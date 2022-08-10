import GoogleMobileAds
import UIKit

class AMBBannerStackView: UIStackView {
    static let shared = AMBBannerStackView(frame: AMBHelper.window.frame)

    static let topConstraint = shared.topAnchor.constraint(equalTo: AMBHelper.topAnchor, constant: 0)
    static let bottomConstraint = shared.bottomAnchor.constraint(equalTo: AMBHelper.bottomAnchor, constant: 0)

    lazy var contentView: UIView = {
        let v = UIView(frame: self.frame)
        v.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        v.isUserInteractionEnabled = false
        return v
    }()

    var hasTopBanner: Bool {
        return self.arrangedSubviews.first is AMBBannerPlaceholder
    }

    var hasBottomBanner: Bool {
        return self.arrangedSubviews.last is AMBBannerPlaceholder
    }

    func prepare() {
        if !self.arrangedSubviews.isEmpty {
            return
        }

        self.isUserInteractionEnabled = false
        self.axis = .vertical
        self.distribution = .fill
        self.alignment = .fill
        self.translatesAutoresizingMaskIntoConstraints = false

        self.addArrangedSubview(contentView)
    }
}

class AMBBanner: AMBAdBase, GADBannerViewDelegate, GADAdSizeDelegate {
    static let stackView = AMBBannerStackView.shared

    static let priortyLeast = UILayoutPriority(10)

    static var rootObservation: NSKeyValueObservation?
    static var marginTop: CGFloat?

    static var rootView: UIView {
        return AMBContext.plugin.viewController.view!
    }

    static var mainView: UIView {
        return AMBContext.plugin.webView
    }

    static var statusBarBackgroundView: UIView? {
        let statusBarFrame = UIApplication.shared.statusBarFrame
        return rootView.subviews.first(where: { $0.frame.equalTo(statusBarFrame) })
    }

    static func config(_ ctx: AMBContext) {
        if let bgColor = ctx.optBackgroundColor() {
            Self.rootView.backgroundColor = bgColor
        }
        Self.marginTop = ctx.optMarginTop()
        if Self.marginTop != nil {
            AMBBannerStackView.topConstraint.constant = Self.marginTop!
        }
        if let marginBottom = ctx.optMarginBottom() {
            AMBBannerStackView.bottomConstraint.constant = marginBottom * -1
        }
        ctx.resolve()
    }

    private static func prepareStackView() {
        if stackView.arrangedSubviews.isEmpty {
            var constraints: [NSLayoutConstraint] = []

            stackView.prepare()
            rootView.insertSubview(stackView, belowSubview: mainView)
            constraints += [
                stackView.leadingAnchor.constraint(equalTo: rootView.leadingAnchor),
                stackView.trailingAnchor.constraint(equalTo: rootView.trailingAnchor)
            ]

            mainView.translatesAutoresizingMaskIntoConstraints = false
            let placeholderView = stackView.contentView
            constraints += [
                mainView.leadingAnchor.constraint(equalTo: placeholderView.leadingAnchor),
                mainView.trailingAnchor.constraint(equalTo: placeholderView.trailingAnchor),
                mainView.topAnchor.constraint(equalTo: placeholderView.topAnchor),
                mainView.bottomAnchor.constraint(equalTo: placeholderView.bottomAnchor)
            ]

            let constraintTop = stackView.topAnchor.constraint(equalTo: rootView.topAnchor)
            let constraintBottom = stackView.bottomAnchor.constraint(equalTo: rootView.bottomAnchor)
            constraintTop.priority = priortyLeast
            constraintBottom.priority = priortyLeast
            constraints += [
                constraintBottom,
                constraintTop
            ]
            NSLayoutConstraint.activate(constraints)

            rootObservation = rootView.observe(\.subviews, options: [.old, .new]) { (_, _) in
                updateLayout()
            }
        }
    }

    private static func updateLayout() {
        if let barView = Self.statusBarBackgroundView,
           !barView.isHidden && rootView.subviews.contains(stackView) {
            NSLayoutConstraint.activate([
                stackView.topAnchor.constraint(equalTo: barView.bottomAnchor, constant: Self.marginTop ?? 0)
            ])
        } else {
            AMBBannerStackView.topConstraint.isActive = stackView.hasTopBanner
        }

        AMBBannerStackView.bottomConstraint.isActive = stackView.hasBottomBanner
    }

    let adSize: GADAdSize!
    let position: String!
    let offset: CGFloat?
    var bannerView: GADBannerView!
    let placeholder = AMBBannerPlaceholder()

    init(id: Int, adUnitId: String, adSize: GADAdSize, adRequest: GADRequest, position: String, offset: CGFloat?) {
        self.adSize = adSize
        self.position = position
        self.offset = offset

        super.init(id: id, adUnitId: adUnitId, adRequest: adRequest)
    }

    convenience init?(_ ctx: AMBContext) {
        guard let id = ctx.optId(),
              let adUnitId = ctx.optAdUnitID()
        else {
            return nil
        }
        self.init(id: id,
                  adUnitId: adUnitId,
                  adSize: ctx.optAdSize(),
                  adRequest: ctx.optGADRequest(),
                  position: ctx.optPosition(),
                  offset: ctx.optOffset())
    }

    deinit {
        if bannerView != nil {
            bannerView.delegate = nil
            bannerView.adSizeDelegate = nil
            Self.stackView.removeArrangedSubview(placeholder)
            bannerView.removeFromSuperview()
            bannerView = nil
        }
    }

    override func isLoaded() -> Bool {
        return bannerView != nil
    }

    override func load(_ ctx: AMBContext) {
        if bannerView == nil {
            bannerView = GADBannerView(adSize: self.adSize)
            bannerView.delegate = self
            bannerView.adSizeDelegate = self
            bannerView.rootViewController = plugin.viewController
        }

        bannerView.adUnitID = adUnitId
        bannerView.load(adRequest)

        ctx.resolve()
    }

    override func show(_ ctx: AMBContext) {
        if let offset = self.offset {
            addBannerView(offset)
        } else {
            Self.prepareStackView()

            switch position {
            case AMBBannerPosition.top:
                Self.stackView.insertArrangedSubview(placeholder, at: 0)
            default:
                Self.stackView.addArrangedSubview(placeholder)
            }
            Self.rootView.addSubview(bannerView)

            bannerView.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                placeholder.heightAnchor.constraint(equalTo: bannerView.heightAnchor),
                bannerView.centerXAnchor.constraint(equalTo: placeholder.centerXAnchor),
                bannerView.topAnchor.constraint(equalTo: placeholder.topAnchor),
                bannerView.widthAnchor.constraint(equalTo: placeholder.widthAnchor)
            ])
        }

        if bannerView.isHidden {
            bannerView.isHidden = false
        }

        Self.updateLayout()
        ctx.resolve()
    }

    override func hide(_ ctx: AMBContext) {
        if bannerView != nil {
            bannerView.isHidden = true
            Self.stackView.removeArrangedSubview(placeholder)
            Self.updateLayout()
        }
        ctx.resolve()
    }

    func bannerViewDidReceiveAd(_ bannerView: GADBannerView) {
        self.emit(AMBEvents.adLoad, [
            "size": [
                "width": bannerView.frame.size.width,
                "height": bannerView.frame.size.height,
                "widthInPixels": round(bannerView.frame.size.width * UIScreen.main.scale),
                "heightInPixels": round(bannerView.frame.size.height * UIScreen.main.scale)
            ]
        ])
        self.emit(AMBEvents.bannerLoad)
        self.emit(AMBEvents.bannerSize, [
            "size": [
                "width": bannerView.frame.size.width,
                "height": bannerView.frame.size.height,
                "widthInPixels": round(bannerView.frame.size.width * UIScreen.main.scale),
                "heightInPixels": round(bannerView.frame.size.height * UIScreen.main.scale)
            ]
        ])
    }

    func bannerView(_ bannerView: GADBannerView,
                    didFailToReceiveAdWithError error: Error) {
        self.emit(AMBEvents.adLoadFail, error)
        self.emit(AMBEvents.bannerLoadFail, error)
    }

    func bannerViewDidRecordImpression(_ bannerView: GADBannerView) {
        self.emit(AMBEvents.adImpression)
        self.emit(AMBEvents.bannerImpression)
    }

    func bannerViewDidRecordClick(_ bannerView: GADBannerView) {
        self.emit(AMBEvents.adClick)
    }

    func bannerViewWillPresentScreen(_ bannerView: GADBannerView) {
        self.emit(AMBEvents.adShow)
        self.emit(AMBEvents.bannerOpen)
    }

    func bannerViewWillDismissScreen(_ bannerView: GADBannerView) {
    }

    func bannerViewDidDismissScreen(_ bannerView: GADBannerView) {
        self.emit(AMBEvents.adDismiss)
        self.emit(AMBEvents.bannerClose)
    }

    func adView(_ bannerView: GADBannerView, willChangeAdSizeTo size: GADAdSize) {
        self.emit(AMBEvents.bannerSizeChange, size)
    }

    private func addBannerView(_ offset: CGFloat) {
        let rootView = Self.rootView
        bannerView.translatesAutoresizingMaskIntoConstraints = false
        rootView.addSubview(bannerView)
        rootView.bringSubviewToFront(bannerView)
        var constraints = [
            bannerView.centerXAnchor.constraint(equalTo: rootView.centerXAnchor)
        ]
        switch position {
        case AMBBannerPosition.top:
            constraints += [
                bannerView.topAnchor.constraint(equalTo: rootView.topAnchor,
                                                constant: offset)
            ]
        default:
            constraints += [
                bannerView.bottomAnchor.constraint(equalTo: rootView.bottomAnchor,
                                                   constant: offset * -1)
            ]
        }
        NSLayoutConstraint.activate(constraints)
    }
}
