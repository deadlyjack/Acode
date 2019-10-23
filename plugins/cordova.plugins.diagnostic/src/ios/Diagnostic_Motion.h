/*
 *  Diagnostic_Motion.h
 *  Diagnostic Plugin - Motion Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"

#import <CoreMotion/CoreMotion.h>


@interface Diagnostic_Motion : CDVPlugin

@property (strong, nonatomic) CMMotionActivityManager* motionManager;
@property (strong, nonatomic) NSOperationQueue* motionActivityQueue;
@property (nonatomic, retain) CMPedometer* cmPedometer;

- (void) isMotionAvailable: (CDVInvokedUrlCommand*)command;
- (void) isMotionRequestOutcomeAvailable: (CDVInvokedUrlCommand*)command;
- (void) getMotionAuthorizationStatus: (CDVInvokedUrlCommand*)command;
- (void) requestMotionAuthorization: (CDVInvokedUrlCommand*)command;

@end
