"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingAuthorizationStatus = exports.MaxAdContentRating = exports.MobileAd = exports.start = exports.NativeActions = exports.Events = exports.AdSizeType = exports.execAsync = void 0;
var generated_1 = require("./generated");
var generated_2 = require("./generated");
Object.defineProperty(exports, "execAsync", { enumerable: true, get: function () { return generated_2.execAsync; } });
Object.defineProperty(exports, "AdSizeType", { enumerable: true, get: function () { return generated_2.AdSizeType; } });
Object.defineProperty(exports, "Events", { enumerable: true, get: function () { return generated_2.Events; } });
Object.defineProperty(exports, "NativeActions", { enumerable: true, get: function () { return generated_2.NativeActions; } });
var started = false;
var startPromise = null;
/** @internal */
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startPromise = (0, generated_1.execAsync)(generated_1.NativeActions.start);
                    return [4 /*yield*/, startPromise];
                case 1:
                    result = _a.sent();
                    started = true;
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.start = start;
/** @internal */
var MobileAd = /** @class */ (function () {
    function MobileAd(opts) {
        var _a;
        this._created = false;
        this._init = null;
        this.opts = opts;
        this.id = (_a = opts.id) !== null && _a !== void 0 ? _a : MobileAd.nextId();
        MobileAd.allAds[this.id] = this;
    }
    MobileAd.getAdById = function (id) {
        return this.allAds[id];
    };
    MobileAd.nextId = function () {
        var storage = window.localStorage;
        var key = 'admob-ad-id-counter';
        var value = storage.getItem(key);
        if (value !== null) {
            MobileAd.idCounter = Number(value);
        }
        MobileAd.idCounter += 1;
        storage.setItem(key, "".concat(MobileAd.idCounter));
        return MobileAd.idCounter;
    };
    Object.defineProperty(MobileAd.prototype, "adUnitId", {
        get: function () {
            return this.opts.adUnitId;
        },
        enumerable: false,
        configurable: true
    });
    MobileAd.prototype.on = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var eventName = args[0], cb = args[1], rest = args.slice(2);
        var type = "admob.ad.".concat(eventName.toLowerCase());
        var listener = function (evt) {
            if (evt.ad === _this) {
                cb(evt);
            }
        };
        document.addEventListener.apply(document, __spreadArray([type, listener], rest, false));
        return function () {
            document.removeEventListener.apply(document, __spreadArray([type, listener], rest, false));
        };
    };
    MobileAd.prototype.isLoaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, (0, generated_1.execAsync)(generated_1.NativeActions.adIsLoaded, [
                                { id: this.id },
                            ])];
                }
            });
        });
    };
    MobileAd.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()
                        // TODO read `opts` in native code?
                    ];
                    case 1:
                        _a.sent();
                        // TODO read `opts` in native code?
                        return [4 /*yield*/, (0, generated_1.execAsync)(generated_1.NativeActions.adLoad, [__assign(__assign({}, this.opts), { id: this.id })])];
                    case 2:
                        // TODO read `opts` in native code?
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MobileAd.prototype.show = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, (0, generated_1.execAsync)(generated_1.NativeActions.adShow, [__assign(__assign({}, opts), { id: this.id })])];
                }
            });
        });
    };
    MobileAd.prototype.hide = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, generated_1.execAsync)(generated_1.NativeActions.adHide, [{ id: this.id }])];
            });
        });
    };
    MobileAd.prototype.init = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var cls;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._created)
                            return [2 /*return*/];
                        if (!!started) return [3 /*break*/, 2];
                        if (startPromise === null)
                            start();
                        return [4 /*yield*/, startPromise];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (this._init === null) {
                            cls = (_a = this.constructor.cls) !== null && _a !== void 0 ? _a : this.constructor.name;
                            this._init = (0, generated_1.execAsync)(generated_1.NativeActions.adCreate, [
                                __assign(__assign({}, this.opts), { id: this.id, cls: cls }),
                            ]);
                        }
                        return [4 /*yield*/, this._init];
                    case 3:
                        _b.sent();
                        this._created = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    MobileAd.type = '';
    MobileAd.allAds = {};
    MobileAd.idCounter = 0;
    return MobileAd;
}());
exports.MobileAd = MobileAd;
var MaxAdContentRating;
(function (MaxAdContentRating) {
    MaxAdContentRating["G"] = "G";
    MaxAdContentRating["MA"] = "MA";
    MaxAdContentRating["PG"] = "PG";
    MaxAdContentRating["T"] = "T";
    MaxAdContentRating["UNSPECIFIED"] = "";
})(MaxAdContentRating = exports.MaxAdContentRating || (exports.MaxAdContentRating = {}));
var TrackingAuthorizationStatus;
(function (TrackingAuthorizationStatus) {
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["notDetermined"] = 0] = "notDetermined";
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["restricted"] = 1] = "restricted";
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["denied"] = 2] = "denied";
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["authorized"] = 3] = "authorized";
})(TrackingAuthorizationStatus = exports.TrackingAuthorizationStatus || (exports.TrackingAuthorizationStatus = {}));
//# sourceMappingURL=api.js.map