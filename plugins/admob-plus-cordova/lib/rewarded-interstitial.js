"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("./shared");
var RewardedInterstitialAd = /** @class */ (function (_super) {
    __extends(RewardedInterstitialAd, _super);
    function RewardedInterstitialAd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RewardedInterstitialAd.prototype.isLoaded = function () {
        return _super.prototype.isLoaded.call(this);
    };
    RewardedInterstitialAd.prototype.load = function () {
        return _super.prototype.load.call(this);
    };
    RewardedInterstitialAd.prototype.show = function () {
        return _super.prototype.show.call(this);
    };
    RewardedInterstitialAd.cls = 'RewardedInterstitialAd';
    return RewardedInterstitialAd;
}(shared_1.MobileAd));
exports.default = RewardedInterstitialAd;
//# sourceMappingURL=rewarded-interstitial.js.map