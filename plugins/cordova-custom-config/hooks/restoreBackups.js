#!/usr/bin/env node

/**********
 * Globals
 **********/
var TAG = "cordova-custom-config";
var SCRIPT_NAME = "restoreBackups.js";

// Pre-existing Cordova npm modules
var deferral, path, cwd;

// Npm dependencies
var logger,
    fs,
    _,
    fileUtils;

// Other globals
var hooksPath;

var restoreBackups = (function(){

    /**********************
     * Internal properties
     *********************/
    var restoreBackups = {}, context, projectName, logFn, settings;

    var PLATFORM_CONFIG_FILES = {
        "ios":{
            "{projectName}-Info.plist": "{projectName}/{projectName}-Info.plist",
            "project.pbxproj": "{projectName}.xcodeproj/project.pbxproj",
            "build.xcconfig": "cordova/build.xcconfig",
            "build-extras.xcconfig": "cordova/build-extras.xcconfig",
            "build-debug.xcconfig": "cordova/build-debug.xcconfig",
            "build-release.xcconfig": "cordova/build-release.xcconfig",
            "Entitlements-Release.plist": "{projectName}/Entitlements-Release.plist",
            "Entitlements-Debug.plist": "{projectName}/Entitlements-Debug.plist"
        },
        "android":{
            "AndroidManifest.xml": "AndroidManifest.xml"
        }
    };

    /*********************
     * Internal functions
     *********************/

    function restorePlatformBackups(platform){
        var configFiles = PLATFORM_CONFIG_FILES[platform],
            backupFile, backupFileName, backupFilePath, backupFileExists, targetFilePath;

        logger.verbose("Checking to see if there are backups to restore...");
        for(backupFile in configFiles){
            backupFileName = parseProjectName(backupFile);
            backupFilePath = path.join(cwd, 'plugins', context.opts.plugin.id, "backup", platform, backupFileName);
            backupFileExists = fileUtils.fileExists(backupFilePath);
            if(backupFileExists){
                targetFilePath = path.join(cwd, 'platforms', platform, parseProjectName(configFiles[backupFile]));
                fileUtils.copySync(backupFilePath, targetFilePath);
                logFn("Restored backup of '"+backupFileName+"' to :"+targetFilePath);
            }
        }
    }

    function parseProjectName(fileName){
        return fileName.replace(/{(projectName)}/g, projectName);
    }

    // Script operations are complete, so resolve deferred promises
    function complete(){
        deferral.resolve();
    }

    /*************
     * Public API
     *************/
    restoreBackups.loadDependencies = function(ctx){
        fs = require('fs'),
        _ = require('lodash'),
        fileUtils = require(path.resolve(hooksPath, "fileUtils.js"))(ctx);
        logger.verbose("Loaded module dependencies");
    };

    restoreBackups.init = function(ctx){
        context = ctx;

        projectName = fileUtils.getProjectName();
        logFn = context.hook === "before_plugin_uninstall" ? logger.log : logger.verbose;

        settings = fileUtils.getSettings();
        if(typeof(settings.autorestore) === "undefined" || settings.autorestore === "false"){
            logger.log("Skipping auto-restore of config file backup(s)");
            complete();
            return;
        }

        // go through each of the platform directories
        var platforms = _.filter(fs.readdirSync('platforms'), function (file) {
            return fs.statSync(path.resolve('platforms', file)).isDirectory();
        });
        _.each(platforms, function (platform, index) {
            platform = platform.trim().toLowerCase();
            try{
                restorePlatformBackups(platform);
                if(index === platforms.length - 1){
                    logger.verbose("Finished restoring backups");
                    complete();
                }
            }catch(e){
                var msg = "Error restoring backups for platform '"+platform+"': "+ e.message;
                logger.error(msg);
                if(settings.stoponerror){
                    deferral.reject(TAG + ": " +msg);
                }
            }
        });
    };

    return restoreBackups;
})();

module.exports = function(ctx) {
    try{
        deferral = require('q').defer();
        path = require('path');
        cwd = path.resolve();

        hooksPath = path.resolve(ctx.opts.projectRoot, "plugins", ctx.opts.plugin.id, "hooks");
        logger = require(path.resolve(hooksPath, "logger.js"))(ctx);

        restoreBackups.loadDependencies(ctx);
    }catch(e){
        e.message = TAG + ": Error loading dependencies for "+SCRIPT_NAME+" - ensure the plugin has been installed via cordova-fetch or run 'npm install cordova-custom-config': "+e.message;
        if(typeof deferral !== "undefined"){
            deferral.reject(e.message);
            return deferral.promise;
        }
        throw e;
    }

    try{
        logger.verbose("Running " + SCRIPT_NAME);
        restoreBackups.init(ctx);
    }catch(e){
        var msg = TAG + ": Error running "+SCRIPT_NAME+": "+e.message;
        deferral.reject(msg);
    }

    return deferral.promise;
};
