#!/usr/bin/env node

/**********
 * Globals
 **********/
var TAG = "cordova-custom-config";
var SCRIPT_NAME = "applyCustomConfig.js";

// Pre-existing Cordova npm modules
var deferral, path, cwd;

// Npm dependencies
var logger,
    fs,
    _ ,
    et,
    plist,
    xcode,
    tostr,
    os,
    fileUtils;

// Other globals
var hooksPath;

var applyCustomConfig = (function(){

    /**********************
     * Internal properties
     *********************/

    /*
     * Constants
     */

    var defaultHook = "after_prepare";

    var elementPrefix = "custom-";

    var androidActivityNames = [
        "CordovaApp",  // Cordova <= 4.2.0
        "MainActivity" // Cordova >= 4.3.0
    ];

    // Tags that can appear multiple times
    // Specified by parent and distinguished by name or label
    var androidMultiples = [
        {
            tag: "uses-permission",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "permission",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "permission-tree",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "permission-group",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "instrumentation",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "uses-configuration",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "uses-feature",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "compatible-screens",
            parent: "./",
            uniqueBy: "name"
        },
        {
            tag: "activity",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "activity-alias",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "service",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "receiver",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "provider",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "uses-library",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "meta-data",
            parent: "./application",
            uniqueBy: "name"
        },
        {
            tag: "intent-filter",
            parent: "./application/activity/[@android:name='MainActivity']",
            uniqueBy: "label"
        },
        {
            tag: "meta-data",
            parent: "./application/activity/[@android:name='MainActivity']",
            uniqueBy: "name"
        }
    ];

    var xcconfigs = ["build.xcconfig", "build-extras.xcconfig", "build-debug.xcconfig", "build-release.xcconfig"];

    var manifestPath = {
        cordovaAndroid6: 'platforms/android/AndroidManifest.xml',
        cordovaAndroid7: 'platforms/android/app/src/main/AndroidManifest.xml'
    };


    // Variables
    var applyCustomConfig = {}, rootdir, plugindir, context, configXml, projectName, settings = {}, updatedFiles = {};

    var preferencesData;
    var resources;

    var syncOperationsComplete = false;
    var asyncOperationsRemaining = 0;

    // Filepath to AndroidManifest.xml in android platform project
    var androidManifestFilePath;

    // Indicates if project is using new cordova@7 structure
    var isNewCordovaAndroid;


    /*********************
     * Internal functions
     *********************/

    // Converts an elementtree object to an xml string.  Since this is used for plist values, we don't care about attributes
    function eltreeToXmlString(data) {
        var tag = data.tag;
        var el = '<' + tag + '>';

        if(data.text && data.text.trim()) {
            el += data.text.trim();
        } else {
            _.each(data.getchildren(), function (child) {
                el += eltreeToXmlString(child);
            });
        }

        el += '</' + tag + '>';
        return el;
    }

    function getElements(elementName, pathPrefix){
        var path = (pathPrefix || '') + elementPrefix + elementName;
        logger.debug("Searching config.xml for prefixed elements: " + path);
        var els = configXml.findall(path);
        if(settings["parse_unprefixed"] === 'true' || (!isNewCordovaAndroid && settings["parse_unprefixed"] !== 'false')){
            path = (pathPrefix || '') + elementName;
            logger.debug("Searching config.xml for unprefixed elements: " + path);
            els = els.concat(configXml.findall(path));
        }
        return els;
    }

    /**
     *  Retrieves all <preferences ..> from config.xml and returns a map of preferences with platform as the key.
     *  If a platform is supplied, common prefs + platform prefs will be returned, otherwise just common prefs are returned.
     */
    function getPlatformPreferences(platform) {
        //init common config.xml prefs if we haven't already
        if(!preferencesData) {
            preferencesData = {
                common: getElements('preference')
            };
        }

        var prefs = preferencesData.common || [];
        if(platform) {
            if(!preferencesData[platform]) {
                preferencesData[platform] = getElements('preference','platform[@name=\'' + platform + '\']/');
            }
            prefs = prefs.concat(preferencesData[platform]);
        }

        return prefs;
    }

    /**
     * Retrieves all <resource> from config.xml and returns a map of resources with platform as the key.
     */
    function getPlatformResources(platform) {
        if(!resources) {
            resources = {};
        }

        if(!resources[platform]) {
            resources[platform] = getElements('resource','platform[@name=\'' + platform + '\']/');
        }
        return resources[platform];
    }

    /**
     * Implementation of _.keyBy so old versions of lodash (<2.0.0) don't cause issues
     */
    function keyBy(arr, fn){
        var result = {};
        arr.forEach(function(v){
            result[fn(v)] = v;
        });
        return result;
    }

    /**
     *  Retrieves all configured xml for a specific platform/target/parent element nested inside a platforms config-file
     *  element within the config.xml.  The config-file elements are then indexed by target|parent so if there are
     *  any config-file elements per platform that have the same target and parent, the last config-file element is used.
     */
    function getConfigFilesByTargetAndParent(platform) {
        var configFileData = getElements('config-file','platform[@name=\'' + platform + '\']');
        var result = keyBy(configFileData, function(item) {
            var parent = item.attrib.parent;

            var mode;
            if (item.attrib.add){
                logger.warn("add=\"true\" is deprecated. Change to mode=\"add\".");
                mode = "add";
            }
            if (item.attrib.mode){
                mode = item.attrib.mode;
            }

            //if parent attribute is undefined /* or */, set parent to top level elementree selector
            if(!parent || parent === '/*' || parent === '*/') {
                parent = './';
            }
            return item.attrib.target + '|' + parent + '|' + mode;
        });
        return result;
    }

    /**
     * Parses the config.xml's preferences and config-file elements for a given platform
     * @param platform
     * @returns {{}}
     */
    function parseConfigXml(platform) {
        var configData = {};
        parsePlatformPreferences(configData, platform);
        parseConfigFiles(configData, platform);
        parseResources(configData, platform);

        return configData;
    }

    /**
     * Retrieves the config.xml's preferences for a given platform and parses them into JSON data
     * @param configData
     * @param platform
     */
    function parsePlatformPreferences(configData, platform) {
        var preferences = getPlatformPreferences(platform);
        switch(platform){
            case "ios":
                parseiOSPreferences(preferences, configData);
                break;
            case "android":
                parseAndroidPreferences(preferences, configData);
                break;
        }
    }

    /**
     * Parses iOS preferences into project.pbxproj
     * @param preferences
     * @param configData
     */
    function parseiOSPreferences(preferences, configData){
        var hasPbxProjPrefs = false;
        _.each(preferences, function (preference) {
            if(preference.attrib.name.match(new RegExp("^ios-"))){
                hasPbxProjPrefs = true;
                var parts = preference.attrib.name.split("-"),
                    target = "project.pbxproj",
                    prefData = {
                        type: parts[1],
                        name: parts[2],
                        value: preference.attrib.value
                    };
                if(preference.attrib.buildType){
                    prefData["buildType"] = preference.attrib.buildType;
                }
                if(preference.attrib.quote){
                    prefData["quote"] = preference.attrib.quote;
                }
                if(preference.attrib.func){
                    prefData["func"] = preference.attrib.func;
                    prefData["args"] = [];
                    _.each(preference.getchildren(), function (arg) {
                        if (arg.tag === "arg") {
                            var value;
                            switch (arg.attrib.type) {
                                case "Null":
                                    value = null;
                                    break;
                                case "Undefined":
                                    value = undefined;
                                    break;
                                case "Object":
                                    value = JSON.parse(arg.attrib.value);
                                    break;
                                case "Number":
                                    value = Number(arg.attrib.value);
                                    break;
                                case "String":
                                    value = String(arg.attrib.value);
                                    break;
                                case "Symbol":
                                    value = Symbol(arg.attrib.value);
                                    break;
                                default:
                                    value = arg.attrib.value;
                                    break;
                            }
                            if (arg.attrib.flag !== undefined) {
                                switch (arg.attrib.flag) {
                                    case "path":
                                        value = path.isAbsolute(value) ? value : path.join("../../", value);
                                        break;
                                }
                            }
                            prefData["args"].push(value);
                        }
                    });
                }

                prefData["xcconfigEnforce"] = preference.attrib.xcconfigEnforce ? preference.attrib.xcconfigEnforce : null;

                if(!configData[target]) {
                    configData[target] = [];
                }
                configData[target].push(prefData);
            }
        });
        if(hasPbxProjPrefs){
            asyncOperationsRemaining++;
        }
    }

    /**
     * Parses supported Android preferences using the preference mapping into the appropriate XML elements in AndroidManifest.xml
     * @param preferences
     * @param configData
     */
    function parseAndroidPreferences(preferences, configData){
        var type = 'preference';

        _.each(preferences, function (preference) {
            // Extract pre-defined preferences (deprecated)
            var target,
                prefData;

            if(preference.attrib.name.match(/^android-manifest\//)){
                // Extract manifest Xpath preferences
                var parts = preference.attrib.name.split("/"),
                    destination = parts.pop();
                parts.shift();

                prefData = {
                    parent: parts.join("/") || "./",
                    type: type,
                    destination: destination,
                    data: preference
                };
                target = "AndroidManifest.xml";
            }

            if(prefData){
                if(!configData[target]) {
                    configData[target] = [];
                }
                configData[target].push(prefData);
            }
        });
    }

    /**
     * Retrieves the config.xml's config-file elements for a given platform and parses them into JSON data
     * @param configData
     * @param platform
     */
    function parseConfigFiles(configData, platform) {
        var configFiles = getConfigFilesByTargetAndParent(platform),
            type = 'configFile';

        _.each(configFiles, function (configFile, key) {
            var keyParts = key.split('|');
            var target = keyParts[0];
            var parent = keyParts[1];
            var mode = keyParts[2];
            var items = configData[target] || [];

            var children = configFile.getchildren();
            if(children.length > 0){
                _.each(children, function (element) {
                    items.push({
                        parent: parent,
                        type: type,
                        destination: element.tag,
                        data: element,
                        mode: mode
                    });
                });
            }else{
                items.push({
                    parent: parent,
                    type: type,
                    mode: mode
                });
            }

            configData[target] = items;
        });
    }

    /**
     * Retrieves the config.xml's resources for a given platform and parses them into JSON data
     * @param configData
     * @param platform
     */
    function parseResources(configData, platform) {
        var resources = getPlatformResources(platform);
        switch(platform){
            case "ios":
                parseiOSResources(resources, configData);
                break;
            case "android":
                break;
        }
    }

    /**
     * Parses supported iOS resources
     * @param resources
     * @param configData
     */
    function parseiOSResources(resources, configData){

        _.each(resources, function (resource) {
            var resourceData, catalog;
            if(resource.attrib.type === "image"){
                catalog = resource.attrib.catalog;
                target = "asset_catalog."+catalog;
                resourceData = {
                    type: resource.attrib.type,
                    catalog: catalog,
                    src: resource.attrib.src,
                    scale: resource.attrib.scale,
                    idiom: resource.attrib.idiom
                };
            }

            if(resourceData){
                if(!configData[target]) {
                    configData[target] = [];
                }
                configData[target].push(resourceData);
            }
        });
    }

    /**
     * @description Create paths if it's not existing
     *
     * @param {object} root - root element
     * @param {object} item - element to add
     *
     * @returns {object}
     */
    function createPath(root, item) {
        var paths = item.parent.split('/'),
            dir, prevEl, el;

        if (paths && paths.length) {
            paths.forEach(function (path, index) {
                dir = paths.slice(0, index + 1).join('/');
                el = root.find(dir);

                if (!el) {
                    el = et.SubElement(prevEl ? prevEl : root, path, {});
                }

                prevEl = el;
            });
        }

        return root.find(item.parent || root.find('*/' + item.parent));
    }

    /**
     * Updates the AndroidManifest.xml target file with data from config.xml
     * @param targetFilePath
     * @param configItems
     */
    function updateAndroidManifest(targetFilePath, configItems) {
        var tempManifest = fileUtils.parseElementtreeSync(targetFilePath),
            root = tempManifest.getroot();

        var isAllowedMultiple = function(tag, parent){
            var multipleConfig = null;
            _.each(androidMultiples, function(multiple){
                if(multiple.tag === tag && multiple.parent === parent){
                    multipleConfig = multiple;
                }
            });
            return multipleConfig;
        };

        _.each(configItems, function (item) {
            // if parent is not found on the root, child/grandchild nodes are searched
            var parentEl = root.find(item.parent) || root.find('*/' + item.parent),
                parentSelector,
                data = item.data,
                childSelector = item.destination,
                childEl;

            _.each(androidActivityNames, function(activityName){
                if(parentEl){
                    return;
                }
                parentSelector = item.parent.replace("{ActivityName}", activityName);
                parentEl = root.find(parentSelector) || root.find('*/' + parentSelector);
            });

            if (item.type === 'preference' && !parentEl) {
                parentEl = createPath(root, item);
            }

            if (!parentEl) {
                return;
            }

            if (item.type === 'preference') {
                logger.debug("**PREFERENCE"); //logger.dump(item);

                logger.debug("**parentEl"); //logger.dump(parentEl);

                if(data.attrib['delete'] === 'true') {
                    logger.debug("Deleting preference");
                    childEl = parentEl.find(childSelector);
                    logger.debug("**childEl"); //logger.dump(childEl);

                    if(childEl) {
                        parentEl.remove(childEl);
                        logger.debug("Deleted preference from parent");
                    } else {
                        childEl = root.find('*/' + childSelector);

                        if (childEl) {
                            root.remove(childEl);
                            logger.debug("Deleted preference from root");
                        }
                    }
                } else {
                    parentEl.attrib[childSelector.replace("@",'')] = data.attrib['value'];
                }
            } else { // item.type === 'configFile'

                logger.debug("**CONFIG-FILE");
                //logger.dump(item);
                logger.debug("childSelector: " + childSelector);

                var multiple = isAllowedMultiple(childSelector, item.parent);
                logger.debug("isAllowedMultiple: "+ !!multiple);


                var copyDataToElement = function(el){
                    // copy all config.xml data except for the generated _id property
                    _.each(data, function (prop, propName) {
                        if(propName !== '_id') {
                            el[propName] = prop;
                        }
                    });
                };

                if(multiple){
                    var uniqueSelector = childSelector + "[@android:"+multiple.uniqueBy+"='" + data.attrib["android:"+multiple.uniqueBy] + "']";
                    childEl = parentEl.find(uniqueSelector);

                    // if child el is not found by unique selector, compare child contents
                    if(!childEl){
                        var similarEls = parentEl.findall(childSelector);
                        if(similarEls){
                            var targetEl = new et.Element(item.destination);
                            copyDataToElement(targetEl);

                            var compareEls; compareEls = function(el1, el2){

                                if(el1.tag !== el2.tag) return false;
                                if(el1.text !== el2.text) return false;
                                for(var name in el1.attrib){
                                    if(!el2.attrib[name] || el1.attrib[name] !== el2.attrib[name]) return false;
                                }
                                if(el1._children.length !== el2._children.length) return false;
                                if(el1._children.length > 0){
                                    for(var i=0; i<el1._children.length; i++){
                                        if(compareEls(el1._children[i], el2._children[i]) === false){
                                            return false;
                                        }
                                    }
                                }
                                return true;
                            };
                            similarEls.forEach(function(similarEl){
                                if(compareEls(targetEl, similarEl) === true){
                                    childEl = similarEl;
                                    return false;
                                }
                            });
                        }
                    }
                }else{
                    childEl = parentEl.find(childSelector);
                }

                logger.debug("**childEl"); //logger.dump(childEl);

                // if child element doesnt exist, create new element
                if(!childEl || item.mode === 'add') {
                    childEl = new et.Element(item.destination);
                    parentEl.append(childEl);
                }

                copyDataToElement(childEl);
            }
        });
        fs.writeFileSync(targetFilePath, tempManifest.write({indent: 4}), 'utf-8');
        logger.verbose("Wrote file " + targetFilePath);
    }


    /**
     * Updates target file with data from config.xml
     * @param targetFilePath
     * @param configItems
     */
    function updateWp8Manifest(targetFilePath, configItems) {
        var tempManifest = fileUtils.parseElementtreeSync(targetFilePath),
            root = tempManifest.getroot();
        _.each(configItems, function (item) {
            // if parent is not found on the root, child/grandchild nodes are searched
            var parentEl = root.find(item.parent) || root.find('*/' + item.parent),
                parentSelector,
                data = item.data,
                childSelector = item.destination,
                childEl;
            if(!parentEl) {
                return;
            }

            _.each(data.attrib, function (prop, propName) {
                childSelector += '[@'+propName+'="'+prop+'"]';
            });

            childEl = parentEl.find(childSelector);
            // if child element doesnt exist, create new element
            if(!childEl) {
                childEl = new et.Element(item.destination);
                parentEl.append(childEl);
            }

            // copy all config.xml data except for the generated _id property
            _.each(data, function (prop, propName) {
                if(propName !== '_id') {
                    childEl[propName] = prop;
                }
            });

        });
        fs.writeFileSync(targetFilePath, tempManifest.write({indent: 4}), 'utf-8');
        logger.verbose("Wrote file " + targetFilePath);
    }

    /**
     * Updates the *-Info.plist file with data from config.xml by parsing to an xml string, then using the plist
     * module to convert the data to a map.  The config.xml data is then replaced or appended to the original plist file
     * @param targetFilePath
     * @param configItems
     */
    function updateIosPlist (targetFilePath, configItems) {
        var infoPlist = plist.parse(fs.readFileSync(targetFilePath, 'utf-8')),
            tempInfoPlist;

        _.each(configItems, function (item) {
            var key = item.parent;
            var plistXml = '<plist><dict><key>' + key + '</key>';
            var value;
            if(item.data){
                plistXml += eltreeToXmlString(item.data) + '</dict></plist>';
                var configPlistObj = plist.parse(plistXml);
                value = configPlistObj[key];
                if (!value && item.data.tag === "string") {
                    value = "";
                }
            }

            //logger.dump(item);
            if (item.mode === 'delete') {
                delete infoPlist[key];
            }else if (item.data.tag === "array" && infoPlist[key] && item.mode !== 'replace') {
                infoPlist[key] = infoPlist[key].concat(value).filter(onlyUnique);
            } else {
                infoPlist[key] = value;
            }
            logger.verbose("Wrote to plist; key=" + key + "; value=" + tostr(infoPlist[key]));
        });

        tempInfoPlist = plist.build(infoPlist);
        tempInfoPlist = tempInfoPlist.replace(/<string>[\s\r\n]*<\/string>/g,'<string></string>');
        fs.writeFileSync(targetFilePath, tempInfoPlist, 'utf-8');
        logger.verbose("Wrote file " + targetFilePath);
    }

    /**
     * Updates the *-Prefix.pch file file with data from config.xml
     */
    function updateIosPch (targetFilePath, configItems) {
        var content = fs.readFileSync(targetFilePath, 'utf-8');
        var strings = [];
        _.each(configItems, function (item) {
            if (item.data.tag === "string") {
                item.data.text && content.indexOf(item.data.text.trim()) === -1 && strings.push(item.data.text.trim());
            } else if (item.data.tag === "array") {
                _.each(item.data.getchildren(), function (child) {
                    child.text && content.indexOf(child.text.trim()) === -1 && strings.push(child.text.trim());
                });
            }
            if (strings.length) {
                fs.appendFileSync(targetFilePath, os.EOL + strings.join(os.EOL) + os.EOL, { encoding: 'utf-8' });
            }
        });
    }

    /**
     * Updates the project.pbxproj file with data from config.xml
     * @param {String} xcodeProjectPath - path to XCode project file
     * @param {Array} configItems - config items to update project file with
     */
    function updateIosPbxProj(xcodeProjectPath, configItems) {
        var xcodeProject = xcode.project(xcodeProjectPath);
        xcodeProject.parse(function(err){
            if(err){
                // shell is undefined if android platform has been removed and added with a new package id but ios stayed the same.
                var msg = 'An error occurred during parsing of [' + xcodeProjectPath + ']: ' + JSON.stringify(err);
                if(typeof shell !== "undefined" && shell !== null){
                    shell.echo(msg);
                } else{
                    logger.error(msg + ' - Maybe you forgot to remove/add the ios platform?');
                }
            }else{
                _.each(configItems, function (item) {
                    switch(item.type){
                        case "XCBuildConfiguration":
                            var buildConfig = xcodeProject.pbxXCBuildConfigurationSection();
                            var replaced = updateXCBuildConfiguration(item, buildConfig, "replace");
                            if(!replaced){
                                updateXCBuildConfiguration(item, buildConfig, "add");
                            }
                            break;
                        case "xcodefunc":
                            if (typeof (xcodeProject[item.func]) === "function") {
                                xcodeProject[item.func].apply(xcodeProject, item.args);
                            }
                            break;
                    }
                });
                fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync(), 'utf-8');
                logger.verbose("Wrote file " + xcodeProjectPath);
            }
            asyncOperationsRemaining--;
            checkComplete();
        });
    }

    /**
     * Updates an XCode build configuration setting with the given item.
     * @param {Object} item - configuration item containing setting data
     * @param {Object} buildConfig - XCode build config object
     * @param {String} mode - update mode: "replace" to replace only existing keys or "add" to add a new key to every block
     * @returns {boolean} true if buildConfig was modified
     */
    function updateXCBuildConfiguration(item, buildConfig, mode){
        var modified = false;
        for(var blockName in buildConfig){
            var block = buildConfig[blockName];

            if(typeof(block) !== "object" || !(block["buildSettings"])) continue;
            var literalMatch = !!block["buildSettings"][item.name],
                quotedMatch = !!block["buildSettings"][quoteEscape(item.name)],
                match = literalMatch || quotedMatch;

            if((match || mode === "add") &&
                (!item.buildType || item.buildType.toLowerCase() === block['name'].toLowerCase())){

                var name;
                if(match){
                    name = literalMatch ? item.name : quoteEscape(item.name);
                }else{
                    // adding
                    name = (item.quote && (item.quote === "none" || item.quote === "value")) ? item.name : quoteEscape(item.name);
                }
                var value = (item.quote && (item.quote === "none" || item.quote === "key")) ? item.value : quoteEscape(item.value);

                block["buildSettings"][name] = value;
                modified = true;
                logger.verbose(mode+" XCBuildConfiguration key={ "+name+" } to value={ "+value+" } for build type='"+block['name']+"' in block='"+blockName+"'");
            }
        }
        return modified;
    }

    /**
     * Checks if Cordova's .xcconfig files contain overrides for the given setting, and if so overwrites the value in the .xcconfig file(s).
     */
    function updateXCConfigs(configItems, platformPath){
        xcconfigs.forEach(function(fileName){
            updateXCConfig(platformPath, fileName, configItems);
        });
    }

    function updateXCConfig(platformPath, targetFileName, configItems){
        var modified = false,
            targetFilePath = path.join(platformPath, 'cordova', targetFileName);

        // Read file contents
        logger.verbose("Reading "+targetFileName);
        var fileContents = fs.readFileSync(targetFilePath, 'utf-8');

        _.each(configItems, function (item) {
            // some keys have name===undefined; ignore these.
            if (item.name) {
                var escapedName = regExpEscape(item.name);
                var fileBuildType = "none";
                if(targetFileName.match("release")){
                    fileBuildType = "release";
                }else if(targetFileName.match("debug")){
                    fileBuildType = "debug";
                }

                var itemBuildType = item.buildType ? item.buildType.toLowerCase() : "none";

                var name = item.name;
                var value = item.value;

                var doReplace = function(){
                    fileContents = fileContents.replace(new RegExp("\n\"?"+escapedName+"\"?.*"), "\n"+name+" = "+value);
                    logger.verbose("Overwrote "+item.name+" with '"+item.value+"' in "+targetFileName);
                    modified = true;
                };

                // If item's target build type matches the xcconfig build type
                if(itemBuildType === fileBuildType)
                {
                    // If config.xml contains any #include statements for use in .xcconfig files
                    if(item.name.match("#INCLUDE") && !fileContents.match(value)) {
                        fileContents += '\n#include "' + value + '"';
                        modified = true;
                    } else {
                        // If file contains the item, replace it with configured value
                        if (fileContents.match(escapedName) && item.xcconfigEnforce !== "false") {
                            doReplace();
                        } else // presence of item is being enforced, so add it to the relevant .xcconfig
                        if (item.xcconfigEnforce === "true") {
                            fileContents += "\n" + name + " = " + value;
                            modified = true;
                        }
                    }
                }else
                // if item is a Debug CODE_SIGNING_IDENTITY, this is a special case: Cordova places its default Debug CODE_SIGNING_IDENTITY in build.xcconfig (not build-debug.xcconfig)
                // so if buildType="debug", want to overrwrite in build.xcconfig
                if(item.name.match("CODE_SIGN_IDENTITY") && itemBuildType === "debug" && fileBuildType === "none" && !item.xcconfigEnforce){
                    doReplace();
                }
            }
        });

        if(modified){
            ensureBackup(targetFilePath, 'ios', targetFileName);
            fs.writeFileSync(targetFilePath, fileContents, 'utf-8');
            logger.verbose("Overwrote "+targetFileName);
        }

    }

    function deployAssetCatalog(targetName, targetDirPath, configItems){
        var contents;
        var contentsFilePath = path.join(targetDirPath, "Contents.json");

        if(!fileUtils.directoryExists(targetDirPath)){
            fileUtils.createDirectory(targetDirPath);
            contents = fs.readFileSync(path.join(plugindir, "templates", "ios", "Contents.json"), 'utf-8');
        }else{
            contents = fs.readFileSync(contentsFilePath);
        }

        try{
            contents = JSON.parse(contents);
        }catch(e){
            logger.error("Unable to parse Contents.json of asset catalog '" + targetName + "' - aborting deployment ");
            return;
        }

        _.each(configItems, function (item) {
            var srcImgFilePath = path.join(cwd, item.src);
            if(!fileUtils.fileExists(srcImgFilePath)){
                logger.error("Resource file not found: "+item.src+" ("+srcImgFilePath+")");
                return;
            }

            var srcImgFileName = srcImgFilePath.split(path.sep).pop();
            var targetImgFilePath = path.join(targetDirPath, srcImgFileName);
            if(fileUtils.fileExists(targetImgFilePath)){
                logger.verbose("Resource file already exists: "+item.src+" ("+targetImgFilePath+")");
                return;
            }

            // Copy source image
            fileUtils.copySync(srcImgFilePath, targetImgFilePath);

            // Create JSON entry
            if(!item.scale || !item.scale.match(/^[1-3]{1}x$/)){
                logger.error("scale must be specified as 1x, 2x or 3x for "+srcImgFileName+" in "+targetName+" asset catalog - skipping image");
                return;
            }
            var entry = {
                filename: srcImgFileName,
                scale: item.scale,
                idiom: item.idiom || "universal"
            };
            contents.images.push(entry);
            fs.writeFileSync(contentsFilePath, JSON.stringify(contents));
        });
    }

    function regExpEscape(literal_string) {
        return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
    }

    function quoteEscape(value){
        return '"'+value+'"';
    }

    function onlyUnique(value, index, self){
        return self.indexOf(value) === index;
    }


    function ensureBackup(targetFilePath, platform, targetFileName){
        var backupDirPath = path.join(plugindir, "backup"),
            backupPlatformPath = path.join(backupDirPath, platform),
            backupFilePath = path.join(backupPlatformPath, targetFileName);


        var backupDirExists = fileUtils.directoryExists(backupDirPath);
        if(!backupDirExists){
            fileUtils.createDirectory(backupDirPath);
            logger.verbose("Created backup directory: "+backupDirPath);
        }

        var backupPlatformExists = fileUtils.directoryExists(backupPlatformPath);
        if(!backupPlatformExists){
            fileUtils.createDirectory(backupPlatformPath);
            logger.verbose("Created backup platform directory: "+backupPlatformPath);
        }

        var backupFileExists = fileUtils.fileExists(backupFilePath);
        if(!backupFileExists){
            fileUtils.copySync(targetFilePath, backupFilePath);
            logger.verbose("Backed up "+targetFilePath+" to "+backupFilePath);
        }else{
            logger.verbose("Backup exists for '"+targetFileName+"' at: "+backupFilePath);
        }

        if(!updatedFiles[targetFilePath]){
            logger.log("Applied custom config from config.xml to "+targetFilePath);
            updatedFiles[targetFilePath] = true;
        }
    }

    /**
     * Parses config.xml data, and update each target file for a specified platform
     * @param platform
     */
    function updatePlatformConfig(platform) {
        if(platform === "android"){
            getAndroidManifestFilePath();
        }

        var configData = parseConfigXml(platform),
            platformPath = path.join(rootdir, 'platforms', platform);

        _.each(configData, function (configItems, targetName) {
            var targetFilePath;
            if (platform === 'ios') {
                if (targetName.indexOf("Info.plist") > -1) {
                    targetName =  projectName + '-Info.plist';
                    targetFilePath = path.join(platformPath, projectName, targetName);
                    ensureBackup(targetFilePath, platform, targetName);
                    updateIosPlist(targetFilePath, configItems);
                }else if (targetName === "project.pbxproj") {
                    targetFilePath = path.join(platformPath, projectName + '.xcodeproj', targetName);
                    ensureBackup(targetFilePath, platform, targetName);
                    updateIosPbxProj(targetFilePath, configItems);
                    updateXCConfigs(configItems, platformPath);
                }else if (targetName.indexOf("Entitlements-Release.plist") > -1) {
                    targetFilePath = path.join(platformPath, projectName, targetName);
                    ensureBackup(targetFilePath, platform, targetName);
                    updateIosPlist(targetFilePath, configItems);
                }else if (targetName.indexOf("Entitlements-Debug.plist") > -1) {
                    targetFilePath = path.join(platformPath, projectName, targetName);
                    ensureBackup(targetFilePath, platform, targetName);
                    updateIosPlist(targetFilePath, configItems);
                }else if (targetName.indexOf("Prefix.pch") > -1) {
                    targetName =  projectName + '-Prefix.pch';
                    targetFilePath = path.join(platformPath, projectName, targetName);
                    ensureBackup(targetFilePath, platform, targetName);
                    updateIosPch(targetFilePath, configItems);
                }else if (targetName.indexOf("asset_catalog") > -1) {
                    targetName =  targetName.split('.')[1];
                    var targetDirPath = path.join(platformPath, projectName, "Images.xcassets", targetName+".imageset");
                    deployAssetCatalog(targetName, targetDirPath, configItems);
                }

            } else if (platform === 'android' && targetName === 'AndroidManifest.xml') {
                targetFilePath = androidManifestFilePath;
                ensureBackup(targetFilePath, platform, targetName);
                updateAndroidManifest(targetFilePath, configItems);
            } else if (platform === 'wp8') {
                targetFilePath = path.join(platformPath, targetName);
                ensureBackup(targetFilePath, platform, targetName);
                updateWp8Manifest(targetFilePath, configItems);
            }
        });
    }

    function getAndroidManifestFilePath(){
        var cordovaAndroid6Path = path.join(rootdir, manifestPath.cordovaAndroid6);
        var cordovaAndroid7Path = path.join(rootdir, manifestPath.cordovaAndroid7);
        if(fileUtils.fileExists(cordovaAndroid7Path)){
            isNewCordovaAndroid = true;
            androidManifestFilePath = cordovaAndroid7Path;
        }else if(fileUtils.fileExists(cordovaAndroid6Path)){
            isNewCordovaAndroid = false;
            androidManifestFilePath = cordovaAndroid6Path;
        }else{
            throw "Can't find AndroidManifest.xml in platforms/Android";
        }
    }

    /**
     * Script operations are complete, so resolve deferred promises
     */
    function complete(){
        logger.verbose("Finished applying platform config");
        deferral.resolve();
    }

    function checkComplete(){
        if(syncOperationsComplete && asyncOperationsRemaining === 0){
            complete();
        }
    }

    /*************
     * Public API
     *************/

    applyCustomConfig.loadDependencies = function(ctx){
        fs = require('fs'),
            _ = require('lodash'),
            et = require('elementtree'),
            plist = require('plist'),
            xcode = require('xcode'),
            tostr = require('tostr'),
            os = require('os'),
            fileUtils = require(path.resolve(hooksPath, "fileUtils.js"))(ctx);
        logger.verbose("Loaded module dependencies");
    };

    applyCustomConfig.init = function(ctx){
        context = ctx;
        rootdir = context.opts.projectRoot;
        plugindir = path.join(cwd, 'plugins', context.opts.plugin.id);

        configXml = fileUtils.getConfigXml();
        projectName = fileUtils.getProjectName();
        settings = fileUtils.getSettings();
        var runHook = settings.hook ? settings.hook : defaultHook;

        if(context.hook !== runHook){
            logger.debug("Aborting applyCustomConfig.js because current hook '"+context.hook+"' is not configured hook '"+runHook+"'");
            return complete();
        }

        // go through each of the context platforms
        _.each(context.opts.platforms, function (platform, index) {
            platform = platform.trim().toLowerCase();
            try{
                updatePlatformConfig(platform);
                if(index === context.opts.platforms.length - 1){
                    syncOperationsComplete = true;
                    checkComplete();
                }
            }catch(e){
                var msg = "Error updating config for platform '"+platform+"': "+ e.message;
                logger.error(msg);
                logger.dump(e);
                if(settings.stoponerror){
                    deferral.reject(TAG + ": " +msg);
                }
            }
        });
    };
    return applyCustomConfig;
})();

// Main
module.exports = function(ctx) {
    try{
        deferral = require('q').defer();
        path = require('path');
        cwd = path.resolve();

        hooksPath = path.resolve(ctx.opts.projectRoot, "plugins", ctx.opts.plugin.id, "hooks");
        logger = require(path.resolve(hooksPath, "logger.js"))(ctx);

        applyCustomConfig.loadDependencies(ctx);
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
        applyCustomConfig.init(ctx);
    }catch(e){
        e.message = TAG + ": Error running "+SCRIPT_NAME+": "+e.message;
        if(typeof deferral !== "undefined"){
            deferral.reject(e.message);
            return deferral.promise;
        }
        throw e;
    }

    return deferral.promise;
};
