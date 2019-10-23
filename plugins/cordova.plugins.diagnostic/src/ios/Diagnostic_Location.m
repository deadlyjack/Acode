/*
 *  Diagnostic_Location.m
 *  Diagnostic Plugin - Location Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Location.h"

@implementation Diagnostic_Location

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Location[native]";


/********************************/
#pragma mark - Plugin API
/********************************/

- (void) isLocationAvailable: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[CLLocationManager locationServicesEnabled] && [self isLocationAuthorized] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isLocationEnabled: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[CLLocationManager locationServicesEnabled] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}


- (void) isLocationAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[self isLocationAuthorized] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) getLocationAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status = [self getLocationAuthorizationStatusAsString:[CLLocationManager authorizationStatus]];
            [diagnostic logDebug:[NSString stringWithFormat:@"Location authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestLocationAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            if ([CLLocationManager instancesRespondToSelector:@selector(requestWhenInUseAuthorization)])
            {
                BOOL always = [[command argumentAtIndex:0] boolValue];
                if(always){
                    NSAssert([[[NSBundle mainBundle] infoDictionary] valueForKey:@"NSLocationAlwaysUsageDescription"], @"For iOS 8 and above, your app must have a value for NSLocationAlwaysUsageDescription in its Info.plist");
                    [self.locationManager requestAlwaysAuthorization];
                    [diagnostic logDebug:@"Requesting location authorization: always"];
                }else{
                    NSAssert([[[NSBundle mainBundle] infoDictionary] valueForKey:@"NSLocationWhenInUseUsageDescription"], @"For iOS 8 and above, your app must have a value for NSLocationWhenInUseUsageDescription in its Info.plist");
                    [self.locationManager requestWhenInUseAuthorization];
                    [diagnostic logDebug:@"Requesting location authorization: when in use"];
                }
            }
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
        self.locationRequestCallbackId = command.callbackId;
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
        [diagnostic sendPluginResult:pluginResult :command];
    }];
}

/********************************/
#pragma mark - Internals
/********************************/

- (void)pluginInitialize {

    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];

    self.locationRequestCallbackId = nil;
    self.currentLocationAuthorizationStatus = nil;
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
}

- (NSString*) getLocationAuthorizationStatusAsString: (CLAuthorizationStatus)authStatus
{
    NSString* status;
    if(authStatus == kCLAuthorizationStatusDenied || authStatus == kCLAuthorizationStatusRestricted){
        status = AUTHORIZATION_DENIED;
    }else if(authStatus == kCLAuthorizationStatusNotDetermined){
        status = AUTHORIZATION_NOT_DETERMINED;
    }else if(authStatus == kCLAuthorizationStatusAuthorizedAlways){
        status = AUTHORIZATION_GRANTED;
    }else if(authStatus == kCLAuthorizationStatusAuthorizedWhenInUse){
        status = @"authorized_when_in_use";
    }
    return status;
}

- (BOOL) isLocationAuthorized
{
    CLAuthorizationStatus authStatus = [CLLocationManager authorizationStatus];
    NSString* status = [self getLocationAuthorizationStatusAsString:authStatus];
    if([status  isEqual: AUTHORIZATION_GRANTED] || [status  isEqual: @"authorized_when_in_use"]) {
        return true;
    } else {
        return false;
    }
}

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)authStatus {
    NSString* status = [self getLocationAuthorizationStatusAsString:authStatus];
    BOOL statusChanged = false;
    if(self.currentLocationAuthorizationStatus != nil && ![status isEqual: self.currentLocationAuthorizationStatus]){
        statusChanged = true;
    }
    self.currentLocationAuthorizationStatus = status;

    if(!statusChanged) return;


    [diagnostic logDebug:[NSString stringWithFormat:@"Location authorization status changed to: %@", status]];

    if(self.locationRequestCallbackId != nil){
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:status];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.locationRequestCallbackId];
        self.locationRequestCallbackId = nil;
    }

    [diagnostic executeGlobalJavascript:[NSString stringWithFormat:@"cordova.plugins.diagnostic.location._onLocationStateChange(\"%@\");", status]];
}


@end
