/*
 *  Diagnostic_Motion.m
 *  Diagnostic Plugin - Motion Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Motion.h"

@implementation Diagnostic_Motion

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Motion[native]";

/********************************/
#pragma mark - Plugin API
/********************************/
- (void) isMotionAvailable:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        @try {

            [diagnostic sendPluginResultBool:[self isMotionAvailable] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isMotionRequestOutcomeAvailable:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        @try {

            [diagnostic sendPluginResultBool:[self isMotionRequestOutcomeAvailable] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) getMotionAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        if([diagnostic getSetting:@"motion_permission_requested"] == nil){
            // Permission not yet requested
            [diagnostic sendPluginResultString:@"not_requested":command];
        }else{
            // Permission has been requested so determine the outcome
            [self _requestMotionAuthorization:command];
        }
    }];
}

- (void) requestMotionAuthorization: (CDVInvokedUrlCommand*)command{
    [self.commandDelegate runInBackground:^{
        if([diagnostic getSetting:@"motion_permission_requested"] != nil){
            [diagnostic sendPluginError:@"requestMotionAuthorization() has already been called and can only be called once after app installation":command];
        }else{
            [self _requestMotionAuthorization:command];
        }
    }];
}


/********************************/
#pragma mark - Internals
/********************************/

- (void)pluginInitialize {

    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];

    self.motionManager = [[CMMotionActivityManager alloc] init];
    self.motionActivityQueue = [[NSOperationQueue alloc] init];
    self.cmPedometer = [[CMPedometer alloc] init];
}

- (void) _requestMotionAuthorization: (CDVInvokedUrlCommand*)command
{
    @try {
        if([self isMotionAvailable]){
            @try {
                [self.cmPedometer queryPedometerDataFromDate:[NSDate date]
                                                      toDate:[NSDate date]
                                                 withHandler:^(CMPedometerData* data, NSError *error) {
                     @try {
                         [diagnostic setSetting:@"motion_permission_requested" forValue:(id)kCFBooleanTrue];
                         NSString* status = UNKNOWN;
                         if (error != nil) {
                             if (error.code == CMErrorMotionActivityNotAuthorized) {
                                 status = AUTHORIZATION_DENIED;
                             }else if (error.code == CMErrorMotionActivityNotEntitled) {
                                 status = @"restricted";
                             }else if (error.code == CMErrorMotionActivityNotAvailable) {
                                 // Motion request outcome cannot be determined on this device
                                 status = AUTHORIZATION_NOT_DETERMINED;
                             }
                         }
                         else{
                             status = AUTHORIZATION_GRANTED;
                         }

                         [diagnostic logDebug:[NSString stringWithFormat:@"Motion tracking authorization status is %@", status]];
                         [diagnostic sendPluginResultString:status:command];
                     }@catch (NSException *exception) {
                         [diagnostic handlePluginException:exception :command];
                     }
                }];
            }@catch (NSException *exception) {
                [diagnostic handlePluginException:exception :command];
            }
        }else{
            // Activity tracking not available on this device
            [diagnostic sendPluginResultString:@"not_available":command];
        }
    }@catch (NSException *exception) {
        [diagnostic handlePluginException:exception :command];
    }
}

- (BOOL) isMotionAvailable
{
    return [CMMotionActivityManager isActivityAvailable];
}

- (BOOL) isMotionRequestOutcomeAvailable
{
    return [CMPedometer respondsToSelector:@selector(isPedometerEventTrackingAvailable)] && [CMPedometer isPedometerEventTrackingAvailable];
}

@end
