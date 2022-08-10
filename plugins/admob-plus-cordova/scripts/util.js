"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTextFile = exports.enhanceContext = void 0;
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
async function enhanceContext(context) {
    const ctx = context;
    const { projectRoot } = context.opts;
    if (context.opts.cordova.platforms.includes('ios')) {
        const plistPath = await (0, fast_glob_1.default)('*/*-Info.plist', {
            cwd: path_1.default.join(projectRoot, 'platforms/ios'),
            onlyFiles: true,
            absolute: true,
        }).then((files) => files[0]);
        ctx.ios = {
            plistPath,
            rootDir: (...args) => path_1.default.join(plistPath, '..', ...args),
        };
    }
    return ctx;
}
exports.enhanceContext = enhanceContext;
async function updateTextFile(filename, update) {
    const content = await fs_extra_1.default.readFile(filename, 'utf8');
    const contextUpdated = update(content);
    if (contextUpdated === undefined || contextUpdated === content)
        return;
    await fs_extra_1.default.writeFile(filename, contextUpdated);
}
exports.updateTextFile = updateTextFile;
