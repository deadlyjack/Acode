/*
 *  Diagnostic_Bluetooth.m
 *  Diagnostic Plugin - Bluetooth Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Bluetooth.h"

@implementation Diagnostic_Bluetooth

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Bluetooth[native]";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];
}

/********************************/
#pragma mark - Plugin API
/********************************/

- (void) isBluetoothAvailable: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* state = [self getBluetoothState];
            bool bluetoothEnabled;
            if([state  isEqual: @"powered_on"]){
                bluetoothEnabled = true;
            }else{
                bluetoothEnabled = false;
            }
            [diagnostic sendPluginResultBool:bluetoothEnabled :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) getBluetoothState: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* state = [self getBluetoothState];
            [diagnostic logDebug:[NSString stringWithFormat:@"Bluetooth state is: %@", state]];
            [diagnostic sendPluginResultString:state:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];

}

- (void) requestBluetoothAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* state = [self getBluetoothState];

            if([state isEqual: @"unauthorized"]){
                /*
                 When the application requests to start scanning for bluetooth devices that is when the user is presented with a consent dialog.
                 */
                [diagnostic logDebug:@"Requesting bluetooth authorization"];
                [self ensureBluetoothManager];
                [self.bluetoothManager scanForPeripheralsWithServices:nil options:nil];
                [self.bluetoothManager stopScan];
            }else{
                [diagnostic logDebug:@"Bluetooth authorization is already granted"];
            }
            [diagnostic sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) ensureBluetoothManager: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [self ensureBluetoothManager];
            [diagnostic sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];

}

/********************************/
#pragma mark - Internals
/********************************/

- (NSString*)getBluetoothState{
    NSString* state;
    NSString* description;

    [self ensureBluetoothManager];
    switch(self.bluetoothManager.state)
    {

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
        case CBManagerStateResetting:
#else
        case CBCentralManagerStateResetting:
#endif
            state = @"resetting";
            description =@"The connection with the system service was momentarily lost, update imminent.";
            break;

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
        case CBManagerStateUnsupported:
#else
        case CBCentralManagerStateUnsupported:
#endif
            state = @"unsupported";
            description = @"The platform doesn't support Bluetooth Low Energy.";
            break;

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
        case CBManagerStateUnauthorized:
#else
        case CBCentralManagerStateUnauthorized:
#endif
            state = @"unauthorized";
            description = @"The app is not authorized to use Bluetooth Low Energy.";
            break;

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
        case CBManagerStatePoweredOff:
#else
        case CBCentralManagerStatePoweredOff:
#endif
            state = @"powered_off";
            description = @"Bluetooth is currently powered off.";
            break;

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
        case CBManagerStatePoweredOn:
#else
        case CBCentralManagerStatePoweredOn:
#endif
            state = @"powered_on";
            description = @"Bluetooth is currently powered on and available to use.";
            break;
        default:
            state = UNKNOWN;
            description = @"State unknown, update imminent.";
            break;
    }
    [diagnostic logDebug:[NSString stringWithFormat:@"Bluetooth state changed: %@",description]];


    return state;
}

- (void) ensureBluetoothManager {
    if(![self.bluetoothManager isKindOfClass:[CBCentralManager class]]){
        self.bluetoothManager = [[CBCentralManager alloc]
                                 initWithDelegate:self
                                 queue:dispatch_get_main_queue()
                                 options:@{CBCentralManagerOptionShowPowerAlertKey: @(NO)}];
        [self centralManagerDidUpdateState:self.bluetoothManager]; // Send initial state
    }
}

/********************************/
#pragma mark - CBCentralManagerDelegate
/********************************/

- (void) centralManagerDidUpdateState:(CBCentralManager *)central {
    NSString* state = [self getBluetoothState];
    NSString* jsString = [NSString stringWithFormat:@"cordova.plugins.diagnostic.bluetooth._onBluetoothStateChange(\"%@\");", state];
    [diagnostic executeGlobalJavascript:jsString];
}

@end
