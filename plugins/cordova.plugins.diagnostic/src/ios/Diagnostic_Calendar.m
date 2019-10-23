/*
 *  Diagnostic_Calendar.m
 *  Diagnostic Plugin - Calendar Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Calendar.h"


@implementation Diagnostic_Calendar

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Calendar[native]";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];

}

/********************************/
#pragma mark - Plugin API
/********************************/

- (void) getCalendarAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status;

            EKAuthorizationStatus authStatus = [EKEventStore authorizationStatusForEntityType:EKEntityTypeEvent];

            if(authStatus == EKAuthorizationStatusDenied || authStatus == EKAuthorizationStatusRestricted){
                status = AUTHORIZATION_DENIED;
            }else if(authStatus == EKAuthorizationStatusNotDetermined){
                status = AUTHORIZATION_NOT_DETERMINED;
            }else if(authStatus == EKAuthorizationStatusAuthorized){
                status = AUTHORIZATION_GRANTED;
            }
            [diagnostic logDebug:[NSString stringWithFormat:@"Calendar event authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isCalendarAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            EKAuthorizationStatus authStatus = [EKEventStore authorizationStatusForEntityType:EKEntityTypeEvent];
            [diagnostic sendPluginResultBool:authStatus == EKAuthorizationStatusAuthorized:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestCalendarAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {

            if (!self.eventStore) {
                self.eventStore = [EKEventStore new];
            }

            [self.eventStore requestAccessToEntityType:EKEntityTypeEvent completion:^(BOOL granted, NSError *error) {
                [diagnostic logDebug:[NSString stringWithFormat:@"Access request to calendar events: %d", granted]];
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
