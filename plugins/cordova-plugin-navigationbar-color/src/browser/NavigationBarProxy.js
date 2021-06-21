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

 function notSupported(win,fail) {
     //
     console.log('NavigationBar is not supported');
     setTimeout(function(){
         win();
         // note that while it is not explicitly supported, it does not fail
         // this is really just here to allow developers to test their code in the browser
         // and if we fail, then their app might as well. -jm
     },0);
 }

module.exports = {
    isVisible: false,
//    styleBlackTranslucent:notSupported,
//    styleDefault:notSupported,
//    styleLightContent:notSupported,
//    styleBlackOpaque:notSupported,
//    overlaysWebView:notSupported,
//    styleLightContect: notSupported,
    backgroundColorByName: notSupported,
    backgroundColorByHexString: notSupported,
//    hide: notSupported,
//    show: notSupported,
    _ready:notSupported
};

require("cordova/exec/proxy").add("NavigationBar", module.exports);
