/*
 *  Diagnostic_Wifi.h
 *  Diagnostic Plugin - Wifi Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"


@interface Diagnostic_Wifi : CDVPlugin

- (void) isWifiAvailable: (CDVInvokedUrlCommand*)command;
- (void) isWifiEnabled: (CDVInvokedUrlCommand*)command;

@end
