/*
 *  Diagnostic_Bluetooth.h
 *  Diagnostic Plugin - Bluetooth Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"
#import <CoreBluetooth/CoreBluetooth.h>


@interface Diagnostic_Bluetooth : CDVPlugin <CBCentralManagerDelegate>

@property (nonatomic, retain) CBCentralManager* bluetoothManager;

- (void) isBluetoothAvailable: (CDVInvokedUrlCommand*)command;
- (void) getBluetoothState: (CDVInvokedUrlCommand*)command;
- (void) requestBluetoothAuthorization: (CDVInvokedUrlCommand*)command;
- (void) ensureBluetoothManager: (CDVInvokedUrlCommand*)command;

@end
