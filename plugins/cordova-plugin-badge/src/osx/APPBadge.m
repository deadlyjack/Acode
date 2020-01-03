/*
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
 */

#import "APPBadge.h"
#import "DockCircularProgressBar.h"
#import "DockDownloadProgressBar.h"

@implementation APPBadge

static NSString * const kAPPBadgeConfigKey = @"APPBadgeConfigKey";

enum APPBadgeIndicator { kAPPBadgeIndicatorBadge, kAPPBadgeIndicatorCircular, kAPPBadgeIndicatorDownload };

#pragma mark -
#pragma mark Interface

/**
 * Load the badge config.
 */
- (void) load:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* result;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                   messageAsDictionary:self.config];

        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    }];
}

/**
 * Save the badge config.
 */
- (void) save:(CDVInvokedUrlCommand *)command
{
    int badge = self.badgeValue;

    [self.commandDelegate runInBackground:^{
        [self.settings setObject:[command argumentAtIndex:0]
                          forKey:kAPPBadgeConfigKey];
        
        if (badge != 0) {
            [self setBadgeValue:badge];
        }
    }];
}

/**
 * Clear the badge number.
 */
- (void) clear:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        [self sendPluginResult:CDVCommandStatus_OK
                 messageAsLong:0
                    callbackId:command.callbackId];
    }];

    dispatch_async(dispatch_get_main_queue(), ^{
        self.dock.badgeLabel = @"";
        [self.cbar clear];
        [self.dbar clear];
    });
}

/**
 * Set the badge number.
 */
- (void) set:(CDVInvokedUrlCommand *)command
{
    NSArray* args = [command arguments];
    int number    = [[args objectAtIndex:0] intValue];

    if (number == 0) {
        return [self clear:command];
    }
    
    [self.commandDelegate runInBackground:^{
        [self setBadgeValue:number];
        [self sendPluginResult:CDVCommandStatus_OK
                 messageAsLong:number
                    callbackId:command.callbackId];
    }];
}

/**
 * Get the badge number.
 */
- (void) get:(CDVInvokedUrlCommand *)command
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendPluginResult:CDVCommandStatus_OK
                 messageAsLong:self.badgeValue
                    callbackId:command.callbackId];
    });
}

#pragma mark -
#pragma mark Core

/**
 * Set the badge value.
 *
 * @param [ Int ] value The value to set.
 *
 * @return [ Void ]
 */
- (void) setBadgeValue:(int)value
{
    dispatch_async(dispatch_get_main_queue(), ^{
        switch (self.indicator) {
            case kAPPBadgeIndicatorCircular:
                self.dock.badgeLabel = @"";
                [self.dbar clear];
                [self.cbar setProgress:value/100.0];
                [self.cbar setShowPercent:YES];
                [self.cbar updateProgressBar];
                break;
                
            case kAPPBadgeIndicatorDownload:
                self.dock.badgeLabel = @"";
                [self.cbar clear];
                [self.dbar setProgress:value/100.0];
                [self.dbar updateProgressBar];
                break;
                
            default:
                [self.cbar clear];
                [self.dbar clear];
                self.dock.badgeLabel = @(value).stringValue;
        }
    });
}

/**
 * Get the badge value.
 *
 * @return [ Int ]
 */
- (int) badgeValue
{
    switch (self.indicator) {
        case kAPPBadgeIndicatorCircular:
            return rint(100 * self.cbar.doubleValue);
            break;
            
        case kAPPBadgeIndicatorDownload:
            return rint(100 * self.dbar.doubleValue);
            break;
            
        default:
            return [self.dock badgeLabel].intValue;
    }
}

#pragma mark -
#pragma mark Helper

/**
 * Short hand for shared dock instance.
 */
- (NSDockTile*) dock
{
    return [NSApp dockTile];
}

/**
 * Short hand for shared circular progress bar.
 */
- (DockCircularProgressBar*) cbar
{
    return [DockCircularProgressBar sharedDockCircularProgressBar];
}

/**
 * Short hand for shared circular progress bar.
 */
- (DockDownloadProgressBar*) dbar
{
    return [DockDownloadProgressBar sharedDockDownloadProgressBar];
}

/**
 * Short hand for standard user defaults instance.
 */
- (NSUserDefaults*) settings
{
    return [NSUserDefaults standardUserDefaults];
}

/**
 * The saved config properties.
 */
- (NSDictionary*) config
{
    return [self.settings objectForKey:kAPPBadgeConfigKey];
}

/**
 * The indicator type.
 *
 * @return [ NSString* ]
 */
- (enum APPBadgeIndicator) indicator
{
    NSString* indicator = [self.config objectForKey:@"indicator"];
    
    if ([indicator isEqualToString:@"circular"])
        return kAPPBadgeIndicatorCircular;
    
    if ([indicator isEqualToString:@"download"])
        return kAPPBadgeIndicatorDownload;
        
    return kAPPBadgeIndicatorBadge;
}

/**
 * Sends a plugin result with the specified status and message.
 */
- (void) sendPluginResult:(CDVCommandStatus)status
            messageAsBool:(BOOL)msg
               callbackId:(NSString*)callbackId
{
    CDVPluginResult* result;

    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                 messageAsBool:msg];

    [self.commandDelegate sendPluginResult:result
                                callbackId:callbackId];
}

/**
 * Sends a plugin result with the specified status and message.
 */
- (void) sendPluginResult:(CDVCommandStatus)status
            messageAsLong:(long)msg
               callbackId:(NSString*)callbackId
{
    CDVPluginResult* result;

    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                 messageAsDouble:msg];

    [self.commandDelegate sendPluginResult:result
                                callbackId:callbackId];
}

@end
