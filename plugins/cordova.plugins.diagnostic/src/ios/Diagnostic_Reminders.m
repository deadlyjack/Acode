/*
 *  Diagnostic_Reminders.m
 *  Diagnostic Plugin - Reminders Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Reminders.h"

@implementation Diagnostic_Reminders

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Reminders[native]";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];

}

/********************************/
#pragma mark - Plugin API
/********************************/

- (void) getRemindersAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status;

            EKAuthorizationStatus authStatus = [EKEventStore authorizationStatusForEntityType:EKEntityTypeReminder];

            if(authStatus == EKAuthorizationStatusDenied || authStatus == EKAuthorizationStatusRestricted){
                status = AUTHORIZATION_DENIED;
            }else if(authStatus == EKAuthorizationStatusNotDetermined){
                status = AUTHORIZATION_NOT_DETERMINED;
            }else if(authStatus == EKAuthorizationStatusAuthorized){
                status = AUTHORIZATION_GRANTED;
            }
            [diagnostic logDebug:[NSString stringWithFormat:@"Reminders authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isRemindersAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            EKAuthorizationStatus authStatus = [EKEventStore authorizationStatusForEntityType:EKEntityTypeReminder];
            [diagnostic sendPluginResultBool:authStatus == EKAuthorizationStatusAuthorized:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestRemindersAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {

            if (!self.eventStore) {
                self.eventStore = [EKEventStore new];
            }

            [self.eventStore requestAccessToEntityType:EKEntityTypeReminder completion:^(BOOL granted, NSError *error) {
                [diagnostic logDebug:[NSString stringWithFormat:@"Access request to reminders: %d", granted]];
                [diagnostic sendPluginResultBool:granted:command];
            }];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

/********************************/
#pragma mark - Internals
/********************************/


@end
