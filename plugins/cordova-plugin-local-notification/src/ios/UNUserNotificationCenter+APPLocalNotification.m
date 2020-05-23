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

#import "UNUserNotificationCenter+APPLocalNotification.h"
#import "UNNotificationRequest+APPLocalNotification.h"

@import UserNotifications;

NSString * const kAPPGeneralCategory = @"GENERAL";

@implementation UNUserNotificationCenter (APPLocalNotification)

#pragma mark -
#pragma mark NotificationCategory

/**
 * Register general notification category to listen for dismiss actions.
 *
 * @return [ Void ]
 */
- (void) registerGeneralNotificationCategory
{
    UNNotificationCategory* category;

    category = [UNNotificationCategory
                categoryWithIdentifier:kAPPGeneralCategory
                actions:@[]
                intentIdentifiers:@[]
                options:UNNotificationCategoryOptionCustomDismissAction];

    [self setNotificationCategories:[NSSet setWithObject:category]];
}

/**
 * Add the specified category to the list of categories.
 *
 * @param [ UNNotificationCategory* ] category The category to add.
 *
 * @return [ Void ]
 */
- (void) addNotificationCategory:(UNNotificationCategory*)category
{
    if (!category)
        return;

    [self getNotificationCategoriesWithCompletionHandler:^(NSSet<UNNotificationCategory *> *set) {
        NSMutableSet* categories = [NSMutableSet setWithSet:set];

        for (UNNotificationCategory* item in categories) {
            if ([category.identifier isEqualToString:item.identifier]) {
                [categories removeObject:item];
                break;
            }
        }

        [categories addObject:category];
        [self setNotificationCategories:categories];
    }];
}

#pragma mark -
#pragma mark LocalNotifications

/**
 * List of all delivered or still pending notifications.
 */
- (NSArray*) getNotifications
{
    NSMutableArray* notifications = [[NSMutableArray alloc] init];

    [notifications addObjectsFromArray:[self getPendingNotifications]];
    [notifications addObjectsFromArray:[self getDeliveredNotifications]];

    return notifications;
}

/**
 * List of all triggered notifications.
 */
- (NSArray*) getDeliveredNotifications
{
    NSMutableArray* notifications = [[NSMutableArray alloc] init];
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);

    [self getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> *delivered) {
        for (UNNotification* notification in delivered) {
            [notifications addObject:notification.request];
        }
        dispatch_semaphore_signal(sema);
    }];

    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);

    return notifications;
}

/**
 * List of all pending notifications.
 */
- (NSArray*) getPendingNotifications
{
    NSMutableArray* notifications = [[NSMutableArray alloc] init];
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);

    [self getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> *requests) {
        [notifications addObjectsFromArray:requests];
        dispatch_semaphore_signal(sema);
    }];

    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);

    return notifications;
}

/**
 * List of all notifications from given type.
 *
 * @param type
 *      Notification life cycle type
 */
- (NSArray*) getNotificationsByType:(APPNotificationType)type
{
    switch (type) {
        case NotifcationTypeScheduled:
            return [self getPendingNotifications];

        case NotifcationTypeTriggered:
            return [self getDeliveredNotifications];

        default:
            return [self getNotifications];
    }
}

/**
 * List of all local notifications IDs.
 */
- (NSArray*) getNotificationIds
{
    NSArray* notifications = [self getNotifications];
    NSMutableArray* ids    = [[NSMutableArray alloc] init];

    for (UNNotificationRequest* notification in notifications)
    {
        [ids addObject:notification.options.id];
    }

    return ids;
}

/**
 * List of all notifications IDs from given type.
 *
 * @param type
 *      Notification life cycle type
 */
- (NSArray*) getNotificationIdsByType:(APPNotificationType)type
{
    NSArray* notifications = [self getNotificationsByType:type];
    NSMutableArray* ids    = [[NSMutableArray alloc] init];

    for (UNNotificationRequest* notification in notifications)
    {
        [ids addObject:notification.options.id];
    }

    return ids;
}

/**
 * Find notification by ID.
 *
 * @param id
 *      Notification ID
 */
- (UNNotificationRequest*) getNotificationWithId:(NSNumber*)id
{
    NSArray* notifications = [self getNotifications];

    for (UNNotificationRequest* notification in notifications)
    {
        NSString* fid = [NSString stringWithFormat:@"%@", notification.options.id];
        
        if ([fid isEqualToString:[id stringValue]]) {
            return notification;
        }
    }
    
    return NULL;
}

/**
 * Find notification type by ID
 */
- (APPNotificationType) getTypeOfNotificationWithId:(NSNumber*)id
{
    NSArray* ids = [self getNotificationIdsByType:NotifcationTypeTriggered];
    
    if ([ids containsObject:id])
        return NotifcationTypeTriggered;

    ids = [self getNotificationIdsByType:NotifcationTypeScheduled];
    
    if ([ids containsObject:id])
        return NotifcationTypeScheduled;
    
    return NotifcationTypeUnknown;
}

/**
 * List of properties from all notifications.
 */
- (NSArray*) getNotificationOptions
{
    return [self getNotificationOptionsByType:NotifcationTypeAll];
}

/**
 * List of properties from all notifications of given type.
 *
 * @param type
 *      Notification life cycle type
 */
- (NSArray*) getNotificationOptionsByType:(APPNotificationType)type
{
    NSArray* notifications  = [self getNotificationsByType:type];
    NSMutableArray* options = [[NSMutableArray alloc] init];

    for (UNNotificationRequest* notification in notifications)
    {
        [options addObject:notification.options.userInfo];
    }

    return options;
}

/**
 * List of properties from given local notifications.
 *
 * @param ids
 *      Notification IDs
 */
- (NSArray*) getNotificationOptionsById:(NSArray*)ids
{
    NSArray* notifications  = [self getNotifications];
    NSMutableArray* options = [[NSMutableArray alloc] init];
    
    for (UNNotificationRequest* notification in notifications)
    {
        if ([ids containsObject:notification.options.id]) {
            [options addObject:notification.options.userInfo];
        }
    }
    
    return options;
}

/*
 * Clear all notfications.
 */
- (void) clearAllNotifications
{
    [self removeAllDeliveredNotifications];
}

/*
 * Clear Specified notfication.
 *
 * @param notification
 *      The notification object
 */
- (void) clearNotification:(UNNotificationRequest*)notification
{
    NSArray* ids = [[NSArray alloc]
                    initWithObjects:notification.identifier, nil];

    [self removeDeliveredNotificationsWithIdentifiers:ids];
}

/*
 * Cancel all notfications.
 */
- (void) cancelAllNotifications
{
    [self removeAllPendingNotificationRequests];
    [self removeAllDeliveredNotifications];
}

/*
 * Cancel specified notfication.
 *
 * @param notification
 *      The notification object
 */
- (void) cancelNotification:(UNNotificationRequest*)notification
{
    NSArray* ids = [[NSArray alloc]
                    initWithObjects:notification.identifier, nil];

    [self removeDeliveredNotificationsWithIdentifiers:ids];
    [self removePendingNotificationRequestsWithIdentifiers:ids];
}

@end
