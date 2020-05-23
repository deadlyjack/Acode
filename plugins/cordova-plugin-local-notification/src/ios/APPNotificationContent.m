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

#import "APPNotificationContent.h"
#import "APPNotificationOptions.h"
#import <objc/runtime.h>

@import UserNotifications;

static char optionsKey;

@implementation APPNotificationContent : UNMutableNotificationContent

#pragma mark -
#pragma mark Init

/**
 * Initialize a notification with the given options.
 *
 * @param [ NSDictionary* ] dict A key-value property map.
 *
 * @return [ UNMutableNotificationContent ]
 */
- (id) initWithOptions:(NSDictionary*)dict
{
    self = [self init];

    [self setUserInfo:dict];
    [self __init];

    return self;
}

/**
 * Initialize a notification by using the options found under userInfo.
 *
 * @return [ Void ]
 */
- (void) __init
{
    APPNotificationOptions* options = self.options;

    self.title              = options.title;
    self.subtitle           = options.subtitle;
    self.body               = options.text;
    self.sound              = options.sound;
    self.badge              = options.badge;
    self.attachments        = options.attachments;
    self.categoryIdentifier = options.categoryId;
}

#pragma mark -
#pragma mark Public

/**
 * The options used to initialize the notification.
 *
 * @return [ APPNotificationOptions* ] options
 */
- (APPNotificationOptions*) options
{
    APPNotificationOptions* options = [self getOptions];

    if (!options) {
        options = [[APPNotificationOptions alloc]
                   initWithDict:[self userInfo]];

        [self setOptions:options];
    }

    return options;
}

/**
 * The notifcations request ready to add to the notification center including
 * all informations about trigger behavior.
 *
 * @return [ UNNotificationRequest* ]
 */
- (UNNotificationRequest*) request
{
    APPNotificationOptions* opts = [self getOptions];

    return [UNNotificationRequest requestWithIdentifier:opts.identifier
                                                content:self
                                                trigger:opts.trigger];
}

/**
 * The category for the notification with all the actions.
 *
 * @return [ UNNotificationCategory* ]
 */
- (UNNotificationCategory*) category
{
    NSString* categoryId = self.categoryIdentifier;
    NSArray* actions     = self.options.actions;

    if (!actions.count)
        return NULL;

    return [UNNotificationCategory categoryWithIdentifier:categoryId
                                                  actions:actions
                                        intentIdentifiers:@[]
                                                  options:UNNotificationCategoryOptionCustomDismissAction];
}

#pragma mark -
#pragma mark Private

/**
 * The options used to initialize the notification.
 *
 * @return [ APPNotificationOptions* ]
 */
- (APPNotificationOptions*) getOptions
{
    return objc_getAssociatedObject(self, &optionsKey);
}

/**
 * Set the options used to initialize the notification.
 *
 * @param [ NSDictionary* ] dict A key-value property map.
 *
 * @return [ Void ]
 */
- (void) setOptions:(APPNotificationOptions*)options
{
    objc_setAssociatedObject(self, &optionsKey,
                             options, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

@end
