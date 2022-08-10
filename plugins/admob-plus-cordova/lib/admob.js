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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cordova = __importStar(require("cordova"));
var channel_1 = __importDefault(require("cordova/channel"));
var exec_1 = __importDefault(require("cordova/exec"));
var _1 = require(".");
var shared_1 = require("./shared");
var admob = new _1.AdMob();
function onMessageFromNative(event) {
    var data = event.data;
    if (data && data.adId) {
        data.ad = shared_1.MobileAd.getAdById(data.adId);
    }
    cordova.fireDocumentEvent(event.type, data);
}
var feature = 'onAdMobPlusReady';
channel_1.default.createSticky(feature);
channel_1.default.waitForInitialization(feature);
channel_1.default.onCordovaReady.subscribe(function () {
    (0, exec_1.default)(onMessageFromNative, console.error, 'AdMob', shared_1.NativeActions.ready, []);
    channel_1.default.initializationComplete(feature);
});
exports.default = admob;
//# sourceMappingURL=admob.js.map