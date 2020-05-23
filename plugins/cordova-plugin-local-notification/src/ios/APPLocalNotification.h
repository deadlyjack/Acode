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

#import <Cordova/CDVPlugin.h>

@import UserNotifications;

@interface APPLocalNotification : CDVPlugin <UNUserNotificationCenterDelegate>

// Set launchDetails object
- (void) launch:(CDVInvokedUrlCommand*)command;
// Execute all queued events
- (void) ready:(CDVInvokedUrlCommand*)command;

// Check permission to show notifications
- (void) check:(CDVInvokedUrlCommand*)command;
// Request permission to show notifications
- (void) request:(CDVInvokedUrlCommand*)command;

// Register/update an action group
- (void) actions:(CDVInvokedUrlCommand*)command;

// Schedule notifications
- (void) schedule:(CDVInvokedUrlCommand*)command;
// Update set of notifications
- (void) update:(CDVInvokedUrlCommand*)command;
// Clear notifications by id
- (void) clear:(CDVInvokedUrlCommand*)command;
// Clear all notifications
- (void) clearAll:(CDVInvokedUrlCommand*)command;
// Cancel notifications by id
- (void) cancel:(CDVInvokedUrlCommand*)command;
// Cancel all notifications
- (void) cancelAll:(CDVInvokedUrlCommand*)command;

// Notification type
- (void) type:(CDVInvokedUrlCommand*)command;

// List of all notification IDs
- (void) ids:(CDVInvokedUrlCommand*)command;
// List of all scheduled notification IDs
- (void) scheduledIds:(CDVInvokedUrlCommand*)command;
// List of all triggered notification IDs
- (void) triggeredIds:(CDVInvokedUrlCommand*)command;

// Notification by id
- (void) notification:(CDVInvokedUrlCommand*)command;

// List of notifications by id
- (void) notifications:(CDVInvokedUrlCommand*)command;
// List of scheduled notifications by id
- (void) scheduledNotifications:(CDVInvokedUrlCommand*)command;
// List of triggered notifications by id
- (void) triggeredNotifications:(CDVInvokedUrlCommand*)command;

@end
