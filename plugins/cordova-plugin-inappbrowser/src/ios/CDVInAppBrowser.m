/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVInAppBrowser.h"
#import "CDVInAppBrowserOptions.h"
#import "CDVUIInAppBrowser.h"
#import "CDVWKInAppBrowser.h"
#import <Cordova/CDVPluginResult.h>


#pragma mark CDVInAppBrowser

@implementation CDVInAppBrowser

- (void)pluginInitialize
{
    // default values
    self.usewkwebview = NO;

#if __has_include("CDVWKWebViewEngine.h")
    self.wkwebviewavailable = YES;
#else
    self.wkwebviewavailable = NO;
#endif
}

- (void)open:(CDVInvokedUrlCommand*)command
{
    NSString* options = [command argumentAtIndex:2 withDefault:@"" andClass:[NSString class]];
    CDVInAppBrowserOptions* browserOptions = [CDVInAppBrowserOptions parseOptions:options];
    if(browserOptions.usewkwebview && !self.wkwebviewavailable){
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:@{@"type":@"loaderror", @"message": @"usewkwebview option specified but but no plugin that supplies a WKWebView engine is present"}] callbackId:command.callbackId];
        return;
    }
    self.usewkwebview = browserOptions.usewkwebview;
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] open:command];
    }else{
        [[CDVUIInAppBrowser getInstance] open:command];
    }
}

- (void)close:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] close:command];
    }else{
        [[CDVUIInAppBrowser getInstance] close:command];
    }
}


- (void)show:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] show:command];
    }else{
        [[CDVUIInAppBrowser getInstance] show:command];
    }
}

- (void)hide:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] hide:command];
    }else{
        [[CDVUIInAppBrowser getInstance] hide:command];
    }
}


- (void)injectScriptCode:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] injectScriptCode:command];
    }else{
        [[CDVUIInAppBrowser getInstance] injectScriptCode:command];
    }
}

- (void)injectScriptFile:(CDVInvokedUrlCommand*)command
{
     if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] injectScriptFile:command];
    }else{
        [[CDVUIInAppBrowser getInstance] injectScriptFile:command];
    }
}

- (void)injectStyleCode:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] injectStyleCode:command];
    }else{
        [[CDVUIInAppBrowser getInstance] injectStyleCode:command];
    }
}

- (void)injectStyleFile:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] injectStyleFile:command];
    }else{
        [[CDVUIInAppBrowser getInstance] injectStyleFile:command];
    }
}

- (void)loadAfterBeforeload:(CDVInvokedUrlCommand*)command
{
    if(self.usewkwebview){
        [[CDVWKInAppBrowser getInstance] loadAfterBeforeload:command];
    }else{
        [[CDVUIInAppBrowser getInstance] loadAfterBeforeload:command];
    }
}


@end
