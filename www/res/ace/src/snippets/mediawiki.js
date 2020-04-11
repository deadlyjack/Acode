define("ace/snippets/mediawiki",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText =undefined;
exports.scope = "mediawiki";

});                (function() {
                    window.require(["ace/snippets/mediawiki"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            