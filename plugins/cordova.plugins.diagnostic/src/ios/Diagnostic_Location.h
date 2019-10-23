/*
 *  Diagnostic_Location.h
 *  Diagnostic Plugin - Location Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"
#import <CoreLocation/CoreLocation.h>



@interface Diagnostic_Location : CDVPlugin <CLLocationManagerDelegate>

@property (strong, nonatomic) CLLocationManager* locationManager;
@property (nonatomic, retain) NSString* locationRequestCallbackId;
@property (nonatomic, retain) NSString* currentLocationAuthorizationStatus;

- (void) isLocationAvailable: (CDVInvokedUrlCommand*)command;
- (void) isLocationEnabled: (CDVInvokedUrlCommand*)command;
- (void) isLocationAuthorized: (CDVInvokedUrlCommand*)command;
- (void) getLocationAuthorizationStatus: (CDVInvokedUrlCommand*)command;
- (void) requestLocationAuthorization: (CDVInvokedUrlCommand*)command;

@end
