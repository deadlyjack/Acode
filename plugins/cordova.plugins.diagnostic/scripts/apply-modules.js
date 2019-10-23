#!/usr/bin/env node

/**********
 * Globals
 **********/

const PLUGIN_NAME = "Diagnostic plugin";
const PLUGIN_ID = "cordova.plugins.diagnostic";
const PREFERENCE_NAME = PLUGIN_ID + ".modules";

const MODULES = [
    "LOCATION",
    "BLUETOOTH",
    "WIFI",
    "CAMERA",
    "NOTIFICATIONS",
    "MICROPHONE",
    "CONTACTS",
    "CALENDAR",
    "REMINDERS",
    "MOTION",
    "NFC",
    "EXTERNAL_STORAGE"
];

const COMMENT_START = "<!--";
const COMMENT_END = "-->";

// Node dependencies
var path, cwd, fs;

// External dependencies
var et;

// Internal dependencies
var logger;

var projectPath, modulesPath, pluginNodePath, pluginScriptsPath, configXmlPath, pluginXmlPath, configXmlData, pluginXmlText;


/*********************
 * Internal functions
 *********************/

var run = function (){
    var configuredModules = getSelectedModules();
    logger.verbose("Modules: " + configuredModules);

    readPluginXml();
    enableAllModules();
    if(configuredModules){
        MODULES.forEach(function(module){
            if(configuredModules.indexOf(module) === -1){
                disableModule(module);
            }
        });
    }

    writePluginXml();
};


var handleError = function (error) {
    error = PLUGIN_NAME + " - ERROR: " + error;
    if(logger){
        logger.error(error);
    }else{
        console.log(error);
        console.error(error)
    }
    return error;
};

// Parses a given file into an elementtree object
var parseElementtreeSync = function(filename) {
    var contents = fs.readFileSync(filename, 'utf-8');
    if(contents) {
        //Windows is the BOM. Skip the Byte Order Mark.
        contents = contents.substring(contents.indexOf('<'));
    }
    return new et.ElementTree(et.XML(contents));
};

// Parses the config.xml into an elementtree object and stores in the config object
var getConfigXml = function() {
    if(!configXmlData) {
        configXmlData = parseElementtreeSync(configXmlPath);
    }
    return configXmlData;
};

var readPluginXml = function(){
    pluginXmlText = fs.readFileSync(pluginXmlPath, 'utf-8');
};

var writePluginXml = function(){
    fs.writeFileSync(pluginXmlPath, pluginXmlText, 'utf-8');
};

var getSelectedModules = function(){
    var modules = null;
    var preference = getConfigXml().findall("preference[@name='"+PREFERENCE_NAME+"']")[0];
    if(preference){
        modules = preference.attrib.value.split(' ');
    }
    return modules;
};

var enableAllModules = function(){
    MODULES.forEach(function(module){
        var commentedStartRegExp = new RegExp(getModuleStart(module)+COMMENT_START, "g");
        var commentedEndRegExp = new RegExp(COMMENT_END+getModuleEnd(module), "g");
        if(pluginXmlText.match(commentedStartRegExp)){
            pluginXmlText = pluginXmlText.replace(commentedStartRegExp, getModuleStart(module));
            pluginXmlText = pluginXmlText.replace(commentedEndRegExp, getModuleEnd(module));
        }
    });
};

var disableModule = function(module){
    var commentedStart = getModuleStart(module)+COMMENT_START;
    var commentedEnd = COMMENT_END+getModuleEnd(module);
    pluginXmlText = pluginXmlText.replace(new RegExp(getModuleStart(module), "g"), commentedStart);
    pluginXmlText = pluginXmlText.replace(new RegExp(getModuleEnd(module), "g"), commentedEnd);
};

var getModuleStart = function(module){
    return "<!--BEGIN_MODULE "+module+"-->";
};

var getModuleEnd = function(module){
    return "<!--END_MODULE "+module+"-->";
};


/**********
 * Main
 **********/
var main = function() {
    try{
        fs = require('fs');
        path = require('path');
        cwd = path.resolve();
        pluginNodePath = cwd;

        modulesPath = path.resolve(pluginNodePath, "..");
        projectPath = path.resolve(modulesPath, "..");
        pluginScriptsPath = path.resolve(pluginNodePath, "scripts");

        logger = require(path.resolve(pluginScriptsPath, "logger.js"))(modulesPath, PLUGIN_ID);
        et = require(path.resolve(modulesPath, "elementtree"));
    }catch(e){
        handleError("Failed to load dependencies. If using cordova@6 CLI, ensure this plugin is installed with the --fetch option or run 'npm install "+PLUGIN_ID+"': " + e.message);
    }

    try{
        configXmlPath = path.join(projectPath, 'config.xml');
        pluginXmlPath = path.join(pluginNodePath, "plugin.xml");
        run();
    }catch(e){
        handleError(e.message);
    }
};

main();