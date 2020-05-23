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

@interface UNUserNotificationCenter (APPLocalNotification)

extern NSString * const kAPPGeneralCategory;

typedef NS_ENUM(NSUInteger, APPNotificationType) {
    NotifcationTypeAll = 0,
    NotifcationTypeScheduled = 1,
    NotifcationTypeTriggered = 2,
    NotifcationTypeUnknown = 3
};

#define APPNotificationType_DEFINED

@property (readonly, getter=getNotifications) NSArray* localNotifications;
@property (readonly, getter=getNotificationIds) NSArray* localNotificationIds;

// Register general notification category to listen for dismiss actions
- (void) registerGeneralNotificationCategory;
// Add the specified category to the list of categories
- (void) addNotificationCategory:(UNNotificationCategory*)category;

// List of all notification IDs from given type
- (NSArray*) getNotificationIdsByType:(APPNotificationType)type;

// Find notification by ID
- (UNNotificationRequest*) getNotificationWithId:(NSNumber*)id;
// Find notification type by ID
- (APPNotificationType) getTypeOfNotificationWithId:(NSNumber*)id;

// Property list from all local notifications
- (NSArray*) getNotificationOptions;
// Property list from given local notifications
- (NSArray*) getNotificationOptionsById:(NSArray*)ids;
// Property list from all local notifications with type constraint
- (NSArray*) getNotificationOptionsByType:(APPNotificationType)type;

// Clear specified notfication
- (void) clearNotification:(UNNotificationRequest*)notification;
// Clear all notfications
- (void) clearAllNotifications;

// Cancel specified notfication
- (void) cancelNotification:(UNNotificationRequest*)notification;
// Cancel all notfications
- (void) cancelAllNotifications;

@end
