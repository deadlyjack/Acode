/*
 *  Diagnostic_Microphone.h
 *  Diagnostic Plugin - Microphone Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"

#import <AVFoundation/AVFoundation.h>

@interface Diagnostic_Microphone : CDVPlugin

- (void) isMicrophoneAuthorized: (CDVInvokedUrlCommand*)command;
- (void) getMicrophoneAuthorizationStatus: (CDVInvokedUrlCommand*)command;
- (void) requestMicrophoneAuthorization: (CDVInvokedUrlCommand*)command;

@end
