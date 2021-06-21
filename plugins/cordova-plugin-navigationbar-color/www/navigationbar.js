/*
 * Copyright (c) 2016 by Vinicius Fagundes. All rights reserved.
 *
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 *
 */

/** global cordova */

var exec = require('cordova/exec');

var namedColors = {
    "black": "#000000",
    "darkGray": "#A9A9A9",
    "lightGray": "#D3D3D3",
    "white": "#FFFFFF",
    "gray": "#808080",
    "red": "#FF0000",
    "green": "#00FF00",
    "blue": "#0000FF",
    "cyan": "#00FFFF",
    "yellow": "#FFFF00",
    "magenta": "#FF00FF",
    "orange": "#FFA500",
    "purple": "#800080",
    "brown": "#A52A2A"
};

var NavigationBar = {

    isVisible: true,

    backgroundColorByName: function (colorname, lightNavigationBar) {
        return NavigationBar.backgroundColorByHexString(namedColors[colorname], lightNavigationBar);
    },

    backgroundColorByHexString: function (hexString, lightNavigationBar) {
        if (hexString.charAt(0) !== "#") {
            hexString = "#" + hexString;
        }

        if (hexString.length === 4) {
            var split = hexString.split("");
            hexString = "#" + split[1] + split[1] + split[2] + split[2] + split[3] + split[3];
        }

        lightNavigationBar = !!lightNavigationBar;

        exec(null, null, "NavigationBar", "backgroundColorByHexString", [hexString, lightNavigationBar]);
    },

    hide: function () {
        exec(null, null, "NavigationBar", "hide", []);
        NavigationBar.isVisible = false;
    },

    show: function () {
        exec(null, null, "NavigationBar", "show", []);
        NavigationBar.isVisible = true;
    }

};

// prime it. setTimeout so that proxy gets time to init
window.setTimeout(function () {
    exec(function (res) {
        if (typeof res === 'object') {
            if (res.type === 'tap') {
                cordova.fireWindowEvent('navigationTap');
            }
        } else {
            NavigationBar.isVisible = res;
        }
    }, null, "NavigationBar", "_ready", []);
}, 0);

module.exports = NavigationBar;