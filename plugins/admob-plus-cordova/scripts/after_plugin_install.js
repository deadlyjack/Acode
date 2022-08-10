"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_extra_1 = __importDefault(require("fs-extra"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const path_1 = __importDefault(require("path"));
async function iosUpdateAppDelegateHeader(ctx) {
    const { projectRoot } = ctx.opts;
    const headerPath = await fast_glob_1.default('*/Classes/AppDelegate.h', {
        cwd: path_1.default.join(projectRoot, 'platforms/ios'),
        onlyFiles: true,
        absolute: true,
    }).then((files) => files[0]);
    const content = await fs_extra_1.default.readFile(headerPath, 'utf-8');
    const contentUpdated = content.replace(/(@interface AppDelegate : CDVAppDelegate ){}([\s\S]+)(@end)/g, `$1$2
@property(strong, nonatomic) GADAppOpenAd* appOpenAd;

- (void)requestAppOpenAd;
- (void)tryToPresentAd;

$3`);
    await fs_extra_1.default.writeFile(headerPath, contentUpdated);
    // platforms/ios/AdmobBasicExample/Classes/AppDelegate.h
}
iosUpdateAppDelegateHeader({
    opts: {
        projectRoot: '/Users/ratson/code/github/admob-plus/examples/cordova',
    },
});
module.exports = async (ctx) => {
    if (ctx.opts.cordova.platforms.includes('ios')) {
        await iosUpdateAppDelegateHeader(ctx);
    }
};
