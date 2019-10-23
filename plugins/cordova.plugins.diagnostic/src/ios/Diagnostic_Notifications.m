/*
 *  Diagnostic_Notifications.m
 *  Diagnostic Plugin - Notifications Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Notifications.h"

@implementation Diagnostic_Notifications

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Notifications[native]";

static NSString*const REMOTE_NOTIFICATIONS_ALERT = @"alert";
static NSString*const REMOTE_NOTIFICATIONS_SOUND = @"sound";
static NSString*const REMOTE_NOTIFICATIONS_BADGE = @"badge";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];
}

/********************************/
#pragma mark - Plugin API
/********************************/

- (void) isRemoteNotificationsEnabled: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            if ([[UIApplication sharedApplication] respondsToSelector:@selector(registerUserNotificationSettings:)]) {
                // iOS 8+
                if(NSClassFromString(@"UNUserNotificationCenter")) {
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
                    // iOS 10+
                    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
                    [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
                        BOOL userSettingEnabled = settings.authorizationStatus == UNAuthorizationStatusAuthorized;
                        [self isRemoteNotificationsEnabledResult:userSettingEnabled:command];
                    }];
#endif
                } else{
                    // iOS 8 & 9
                    UIUserNotificationSettings *userNotificationSettings = [UIApplication sharedApplication].currentUserNotificationSettings;
                    BOOL userSettingEnabled = userNotificationSettings.types != UIUserNotificationTypeNone;
                    [self isRemoteNotificationsEnabledResult:userSettingEnabled:command];
                }
            } else {
                // iOS7 and below
#if __IPHONE_OS_VERSION_MAX_ALLOWED <= __IPHONE_7_0
                UIRemoteNotificationType enabledRemoteNotificationTypes = [UIApplication sharedApplication].enabledRemoteNotificationTypes;
                BOOL isEnabled = enabledRemoteNotificationTypes != UIRemoteNotificationTypeNone;
                [diagnostic sendPluginResultBool:isEnabled:command];
#endif
            }

        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception:command];
        }
    }];
}
- (void) isRemoteNotificationsEnabledResult: (BOOL) userSettingEnabled : (CDVInvokedUrlCommand*)command
{
    // iOS 8+
    [self _isRegisteredForRemoteNotifications:^(BOOL remoteNotificationsEnabled) {
        BOOL isEnabled = remoteNotificationsEnabled && userSettingEnabled;
        [diagnostic sendPluginResultBool:isEnabled:command];
    }];
}

- (void) getRemoteNotificationTypes: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            if ([[UIApplication sharedApplication] respondsToSelector:@selector(registerUserNotificationSettings:)]) {
                // iOS 8+
                if(NSClassFromString(@"UNUserNotificationCenter")) {
                    // iOS 10+
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
                    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
                    [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
                        BOOL alertsEnabled = settings.alertSetting == UNNotificationSettingEnabled;
                        BOOL badgesEnabled = settings.badgeSetting == UNNotificationSettingEnabled;
                        BOOL soundsEnabled = settings.soundSetting == UNNotificationSettingEnabled;
                        BOOL noneEnabled = !alertsEnabled && !badgesEnabled && !soundsEnabled;
                        [self getRemoteNotificationTypesResult:command:noneEnabled:alertsEnabled:badgesEnabled:soundsEnabled];
                    }];
#endif
                } else{
                    // iOS 8 & 9
                    UIUserNotificationSettings *userNotificationSettings = [UIApplication sharedApplication].currentUserNotificationSettings;
                    BOOL noneEnabled = userNotificationSettings.types == UIUserNotificationTypeNone;
                    BOOL alertsEnabled = userNotificationSettings.types & UIUserNotificationTypeAlert;
                    BOOL badgesEnabled = userNotificationSettings.types & UIUserNotificationTypeBadge;
                    BOOL soundsEnabled = userNotificationSettings.types & UIUserNotificationTypeSound;
                    [self getRemoteNotificationTypesResult:command:noneEnabled:alertsEnabled:badgesEnabled:soundsEnabled];
                }
            } else {
                // iOS7 and below
#if __IPHONE_OS_VERSION_MAX_ALLOWED <= __IPHONE_7_0
                UIRemoteNotificationType enabledRemoteNotificationTypes = [UIApplication sharedApplication].enabledRemoteNotificationTypes;
                BOOL oneEnabled = enabledRemoteNotificationTypes == UIRemoteNotificationTypeNone;
                BOOL alertsEnabled = enabledRemoteNotificationTypes & UIRemoteNotificationTypeAlert;
                BOOL badgesEnabled = enabledRemoteNotificationTypes & UIRemoteNotificationTypeBadge;
                BOOL soundsEnabled = enabledRemoteNotificationTypes & UIRemoteNotificationTypeSound;
                [self getRemoteNotificationTypesResult:command:noneEnabled:alertsEnabled:badgesEnabled:soundsEnabled];
#endif
            }
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}
- (void) getRemoteNotificationTypesResult: (CDVInvokedUrlCommand*)command :(BOOL)noneEnabled :(BOOL)alertsEnabled :(BOOL)badgesEnabled :(BOOL)soundsEnabled
{
    // iOS 8+
    NSMutableDictionary* types = [[NSMutableDictionary alloc]init];
    if(alertsEnabled) {
        [types setValue:@"1" forKey:REMOTE_NOTIFICATIONS_ALERT];
    } else {
        [types setValue:@"0" forKey:REMOTE_NOTIFICATIONS_ALERT];
    }
    if(badgesEnabled) {
        [types setValue:@"1" forKey:REMOTE_NOTIFICATIONS_BADGE];
    } else {
        [types setValue:@"0" forKey:REMOTE_NOTIFICATIONS_BADGE];
    }
    if(soundsEnabled) {
        [types setValue:@"1" forKey:REMOTE_NOTIFICATIONS_SOUND];
    } else {;
        [types setValue:@"0" forKey:REMOTE_NOTIFICATIONS_SOUND];
    }
    [diagnostic sendPluginResultString:[diagnostic objectToJsonString:types]:command];
}


- (void) isRegisteredForRemoteNotifications: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            if ([[UIApplication sharedApplication] respondsToSelector:@selector(registerUserNotificationSettings:)]) {
                // iOS8+
#if defined(__IPHONE_8_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_8_0
                [self _isRegisteredForRemoteNotifications:^(BOOL registered) {
                    [diagnostic sendPluginResultBool:registered :command];
                }];

#endif
            } else {
#if __IPHONE_OS_VERSION_MAX_ALLOWED <= __IPHONE_7_0
                // iOS7 and below
                UIRemoteNotificationType enabledRemoteNotificationTypes = [UIApplication sharedApplication].enabledRemoteNotificationTypes;
                BOOL registered; = enabledRemoteNotificationTypes != UIRemoteNotificationTypeNone;
                [diagnostic sendPluginResultBool:registered :command];
#endif
            }
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) getRemoteNotificationsAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            if(NSClassFromString(@"UNUserNotificationCenter")) {
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
                // iOS 10+
                UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
                [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
                    NSString* status = UNKNOWN;
                    UNAuthorizationStatus authStatus = settings.authorizationStatus;
                    if(authStatus == UNAuthorizationStatusDenied){
                        status = AUTHORIZATION_DENIED;
                    }else if(authStatus == UNAuthorizationStatusNotDetermined){
                        status = AUTHORIZATION_NOT_DETERMINED;
                    }else if(authStatus == UNAuthorizationStatusAuthorized){
                        status = AUTHORIZATION_GRANTED;
                    }
                    [diagnostic logDebug:[NSString stringWithFormat:@"Remote notifications authorization status is: %@", status]];
                    [diagnostic sendPluginResultString:status:command];
                }];
#endif
            } else{
                // iOS <= 9
                [diagnostic sendPluginError:@"getRemoteNotificationsAuthorizationStatus() is not supported below iOS 10":command];
            }
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception:command];
        }
    }];
}

- (void) requestRemoteNotificationsAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* s_options = [command.arguments objectAtIndex:0];
            if([diagnostic isNull:s_options]){
                NSArray* a_options = [NSArray arrayWithObjects:REMOTE_NOTIFICATIONS_ALERT, REMOTE_NOTIFICATIONS_SOUND, REMOTE_NOTIFICATIONS_BADGE, nil];
                s_options = [diagnostic arrayToJsonString:a_options];
            }
            NSDictionary* d_options = [diagnostic jsonStringToDictionary:s_options];

            if(NSClassFromString(@"UNUserNotificationCenter")) {
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
                // iOS 10+
                BOOL omitRegistration = [[command argumentAtIndex:1] boolValue];
                UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];

                [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
                    UNAuthorizationStatus authStatus = settings.authorizationStatus;
                    if(authStatus == UNAuthorizationStatusNotDetermined){
                        UNAuthorizationOptions options = 0;
                        for(id key in d_options){
                            NSString* s_key = (NSString*) key;
                            if([s_key isEqualToString:REMOTE_NOTIFICATIONS_ALERT]){
                                options = options + UNAuthorizationOptionAlert;
                            }else if([s_key isEqualToString:REMOTE_NOTIFICATIONS_SOUND]){
                                options = options + UNAuthorizationOptionSound;
                            }else if([s_key isEqualToString:REMOTE_NOTIFICATIONS_BADGE]){
                                options = options + UNAuthorizationOptionBadge;
                            }
                        }

                        [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:options completionHandler:^(BOOL granted, NSError * _Nullable error) {
                            if(error != nil){
                                [diagnostic sendPluginError:[NSString stringWithFormat:@"Error when requesting remote notifications authorization: %@", error] :command];
                            }else if (granted) {
                                [diagnostic logDebug:@"Remote notifications authorization granted"];
                                if(!omitRegistration){
                                    dispatch_async(dispatch_get_main_queue(), ^{
                                        [[UIApplication sharedApplication] registerForRemoteNotifications];
                                        [diagnostic sendPluginResultString:AUTHORIZATION_GRANTED:command];
                                    });
                                }else{
                                    [diagnostic sendPluginResultString:AUTHORIZATION_GRANTED:command];
                                }
                            }else{
                                [diagnostic sendPluginError:@"Remote notifications authorization was denied" :command];
                            }
                        }];
                    }else if(authStatus == UNAuthorizationStatusAuthorized){
                        [diagnostic logDebug:@"Remote notifications already authorized"];
                        if(!omitRegistration){
                            dispatch_async(dispatch_get_main_queue(), ^{
                                [[UIApplication sharedApplication] registerForRemoteNotifications];
                                [diagnostic sendPluginResultString:AUTHORIZATION_GRANTED:command];
                            });
                        }else{
                            [diagnostic sendPluginResultString:AUTHORIZATION_GRANTED:command];
                        }
                        [diagnostic sendPluginResultString:@"already_authorized":command];
                    }else if(authStatus == UNAuthorizationStatusDenied){
                        [diagnostic sendPluginError:@"Remote notifications authorization is denied" :command];
                    }
                }];
#endif
            } else if(NSClassFromString(@"UIUserNotificationSettings")){
#if defined(__IPHONE_8_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_8_0
                // iOS 8 & 9
                UIUserNotificationType types = 0;
                for(id key in d_options){
                    NSString* s_key = (NSString*) key;
                    if([s_key isEqualToString:REMOTE_NOTIFICATIONS_ALERT]){
                        types = types + UIUserNotificationTypeAlert;
                    }else if([s_key isEqualToString:REMOTE_NOTIFICATIONS_SOUND]){
                        types = types + UIUserNotificationTypeSound;
                    }else if([s_key isEqualToString:REMOTE_NOTIFICATIONS_BADGE]){
                        types = types + UIUserNotificationTypeBadge;
                    }
                }
                UIUserNotificationSettings *mySettings = [UIUserNotificationSettings settingsForTypes:types categories:nil];

                dispatch_async(dispatch_get_main_queue(), ^{
                    [[UIApplication sharedApplication] registerUserNotificationSettings:mySettings];
                    [diagnostic sendPluginResultString:AUTHORIZATION_GRANTED:command];
                });
#endif
            } else{
                // iOS < 8
                [diagnostic sendPluginError:@"requestRemoteNotificationsAuthorization() is not supported below iOS 8" :command];
            }
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception:command];
        }
    }];
}

- (void) _isRegisteredForRemoteNotifications:(void (^)(BOOL result))completeBlock {
    dispatch_async(dispatch_get_main_queue(), ^{
        BOOL registered = [UIApplication sharedApplication].isRegisteredForRemoteNotifications;
        if( completeBlock ){
            completeBlock(registered);
        }
    });
};

@end
