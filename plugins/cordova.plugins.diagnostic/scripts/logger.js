#!/usr/bin/env node

var logger = (function(){

    /**********************
     * Internal properties
     *********************/
    var logger, path, minimist,
        modulesPath, pluginId, hasColors = true, cliArgs;

    function prefixMsg(msg){
        return pluginId+": "+msg;
    }

    /************
     * Public API
     ************/
    logger = {
        init: function(_modulesPath, _pluginId){
            pluginId = _pluginId;
            modulesPath = _modulesPath;

            path = require('path');

            try{
                require(path.resolve(modulesPath, "colors"));
            }catch(e){
                hasColors = false;
            }

            minimist = require(path.resolve(modulesPath, "minimist"));
            cliArgs = minimist(process.argv.slice(2));
        },
        dump: function (obj){
            if(cliArgs["--debug"] || cliArgs["--dump"]) {
                console.log("DUMP: "+require('util').inspect(obj));
            }
        },
        debug: function(msg){
            if(cliArgs["--debug"]){
                msg = "DEBUG: " + msg;
                console.log(msg);
            }
        },
        verbose: function(msg){
            if(cliArgs["--verbose"] || cliArgs["--debug"]){
                msg = prefixMsg(msg);
                if(hasColors){
                    console.log(msg.green);
                }else{
                    console.log(msg);
                }
            }
        },
        log: function(msg){
            msg = prefixMsg(msg);
            if(hasColors){
                console.log(msg.white);
            }else{
                console.log(msg);
            }
        },
        info: function(msg){
            msg = prefixMsg(msg);
            if(hasColors){
                console.log(msg.blue);
            }else{
                console.info(msg);
            }
        },
        warn: function(msg){
            msg = prefixMsg(msg);
            if(hasColors){
                console.log(msg.yellow);
            }else{
                console.warn(msg);
            }
        },
        error: function(msg){
            msg = prefixMsg(msg);
            if(hasColors){
                console.log(msg.red);
            }else{
                console.error(msg);
            }
        }
    };
    return logger;
})();

module.exports = function(modulesPath, pluginId){
    logger.init(modulesPath, pluginId);
    return logger;
};