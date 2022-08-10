"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdMob = exports.RewardedInterstitialAd = exports.RewardedAd = exports.NativeAd = exports.InterstitialAd = exports.BannerAd = exports.AppOpenAd = void 0;
var app_open_1 = __importDefault(require("./app-open"));
exports.AppOpenAd = app_open_1.default;
var banner_1 = __importDefault(require("./banner"));
exports.BannerAd = banner_1.default;
var interstitial_1 = __importDefault(require("./interstitial"));
exports.InterstitialAd = interstitial_1.default;
var native_1 = __importDefault(require("./native"));
exports.NativeAd = native_1.default;
var rewarded_1 = __importDefault(require("./rewarded"));
exports.RewardedAd = rewarded_1.default;
var rewarded_interstitial_1 = __importDefault(require("./rewarded-interstitial"));
exports.RewardedInterstitialAd = rewarded_interstitial_1.default;
var shared_1 = require("./shared");
__exportStar(require("./api"), exports);
var AdMob = /** @class */ (function () {
    function AdMob() {
        this.AppOpenAd = app_open_1.default;
        this.BannerAd = banner_1.default;
        this.InterstitialAd = interstitial_1.default;
        this.NativeAd = native_1.default;
        this.RewardedAd = rewarded_1.default;
        this.RewardedInterstitialAd = rewarded_interstitial_1.default;
        this.Events = shared_1.Events;
        this.TrackingAuthorizationStatus = shared_1.TrackingAuthorizationStatus;
    }
    AdMob.prototype.configure = function (config) {
        return (0, shared_1.execAsync)(shared_1.NativeActions.configure, [config]);
    };
    AdMob.prototype.configRequest = function (requestConfig) {
        return (0, shared_1.execAsync)(shared_1.NativeActions.configRequest, [requestConfig]);
    };
    AdMob.prototype.setAppMuted = function (value) {
        return (0, shared_1.execAsync)(shared_1.NativeActions.setAppMuted, [value]);
    };
    AdMob.prototype.setAppVolume = function (value) {
        return (0, shared_1.execAsync)(shared_1.NativeActions.setAppVolume, [value]);
    };
    AdMob.prototype.start = function () {
        return (0, shared_1.start)();
    };
    AdMob.prototype.requestTrackingAuthorization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(cordova.platformId === "ios" /* ios */)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, shared_1.execAsync)(shared_1.NativeActions.requestTrackingAuthorization)];
                    case 1:
                        n = _a.sent();
                        if (n !== false) {
                            return [2 /*return*/, shared_1.TrackingAuthorizationStatus[shared_1.TrackingAuthorizationStatus[n]]];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    return AdMob;
}());
exports.AdMob = AdMob;
exports.default = AdMob;
//# sourceMappingURL=index.js.map