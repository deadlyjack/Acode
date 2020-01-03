/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
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
 */

#import "APPNotificationOptions.h"
#import "UNNotificationRequest+APPLocalNotification.h"
#import "APPNotificationContent.h"
#import <objc/runtime.h>

@import UserNotifications;

static char optionsKey;

@implementation UNNotificationRequest (APPLocalNotification)

/**
 * Get associated option object
 */
- (APPNotificationOptions*) getOptions
{
    return objc_getAssociatedObject(self, &optionsKey);
}

/**
 * Set associated option object
 */
- (void) setOptions:(APPNotificationOptions*)options
{
    objc_setAssociatedObject(self, &optionsKey,
                             options, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

/**
 * The options provided by the plug-in.
 */
- (APPNotificationOptions*) options
{
    APPNotificationOptions* options = [self getOptions];

    if (!options) {
        options = [[APPNotificationOptions alloc]
                   initWithDict:[self.content userInfo]];

        [self setOptions:options];
    }

    return options;
}

/**
 * If the notification was updated.
 *
 * @return [ BOOL ]
 */
- (BOOL) wasUpdated
{
    return [self.content userInfo][@"updatedAt"] != NULL;
}

/**
 * Encode the user info dict to JSON.
 */
- (NSString*) encodeToJSON
{
    NSString* json;
    NSData* data;
    NSMutableDictionary* obj = [self.content.userInfo mutableCopy];

    [obj removeObjectForKey:@"updatedAt"];

    if (obj == NULL || obj.count == 0)
        return json;

    data = [NSJSONSerialization dataWithJSONObject:obj
                                           options:NSJSONWritingPrettyPrinted
                                             error:NULL];

    json = [[NSString alloc] initWithData:data
                                 encoding:NSUTF8StringEncoding];

    return [json stringByReplacingOccurrencesOfString:@"\n"
                                           withString:@""];
}

@end
