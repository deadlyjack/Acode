/*
 *  Diagnostic_Notifications.h
 *  Diagnostic Plugin - Notifications Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
#import <UserNotifications/UserNotifications.h>
#endif

@interface Diagnostic_Notifications : CDVPlugin

- (void) isRemoteNotificationsEnabled: (CDVInvokedUrlCommand*)command;
- (void) getRemoteNotificationTypes: (CDVInvokedUrlCommand*)command;
- (void) isRegisteredForRemoteNotifications: (CDVInvokedUrlCommand*)command;
- (void) getRemoteNotificationsAuthorizationStatus: (CDVInvokedUrlCommand*)command;
- (void) requestRemoteNotificationsAuthorization: (CDVInvokedUrlCommand*)command;

@end
