#!/usr/bin/env node

var logger = (function(){

    /**********************
     * Internal properties
     *********************/
    var logger, context, hasColors = true;

    try{
        require('colors');
    }catch(e){
        hasColors = false;
    }

    function prefixMsg(msg){
        return context.opts.plugin.id+": "+msg;
    }

    /************
     * Public API
     ************/
    logger = {
        init: function(ctx){
            context = ctx;
        },
        dump: function (obj){
            if(context.cmdLine.match("--debug") || context.cmdLine.match("--dump")) {
                console.log("DUMP: "+require('util').inspect(obj));
            }
        },
        debug: function(msg){
            if(context.cmdLine.match("--debug")){
                msg = "DEBUG: " + msg;
                console.log(msg);
            }
        },
        verbose: function(msg){
            if(context.opts.verbose || context.cmdLine.match("--verbose") || context.cmdLine.match("--debug")){
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

module.exports = function(ctx){
    logger.init(ctx);
    return logger;
};