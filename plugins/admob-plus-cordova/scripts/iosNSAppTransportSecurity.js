"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const plist_1 = __importDefault(require("plist"));
const util_1 = require("./util");
async function iosSetNSAppTransportSecurity(ctx) {
    await (0, util_1.updateTextFile)(ctx.ios.plistPath, (content) => {
        if (content.indexOf('NSAllowsArbitraryLoadsInWebContent') > -1) {
            return;
        }
        const plistObj = plist_1.default.parse(content);
        Object.assign(plistObj, {
            NSAppTransportSecurity: {
                ...plistObj.NSAppTransportSecurity,
                NSAllowsArbitraryLoads: true,
                NSAllowsArbitraryLoadsForMedia: true,
                NSAllowsArbitraryLoadsInWebContent: true,
            },
        });
        return plist_1.default.build(plistObj);
    });
}
module.exports = async (context) => {
    const ctx = await (0, util_1.enhanceContext)(context);
    if (ctx.opts.cordova.platforms.includes('ios')) {
        await iosSetNSAppTransportSecurity(ctx);
    }
};
