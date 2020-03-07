/*
 *  Diagnostic.m
 *  Diagnostic Plugin - Core Module
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic.h"

@implementation Diagnostic

// Public constants
NSString*const UNKNOWN = @"unknown";

NSString*const AUTHORIZATION_NOT_DETERMINED = @"not_determined";
NSString*const AUTHORIZATION_DENIED = @"denied_always";
NSString*const AUTHORIZATION_GRANTED = @"authorized";

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic[native]";

static NSString*const CPU_ARCH_ARMv6 = @"ARMv6";
static NSString*const CPU_ARCH_ARMv7 = @"ARMv7";
static NSString*const CPU_ARCH_ARMv8 = @"ARMv8";
static NSString*const CPU_ARCH_X86 = @"X86";
static NSString*const CPU_ARCH_X86_64 = @"X86_64";

static Diagnostic* diagnostic = nil;

/********************************/
#pragma mark - Public static functions
/********************************/
+ (id) getInstance{
    return diagnostic;
}


/********************************/
#pragma mark - Plugin API
/********************************/

-(void)enableDebug:(CDVInvokedUrlCommand*)command{
    self.debugEnabled = true;
    [self logDebug:@"Debug enabled"];
}

#pragma mark -  Settings
- (void) switchToSettings: (CDVInvokedUrlCommand*)command
{
    @try {
        if (UIApplicationOpenSettingsURLString != nil ){
            if ([[UIApplication sharedApplication] respondsToSelector:@selector(openURL:options:completionHandler:)]) {
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString: UIApplicationOpenSettingsURLString] options:@{} completionHandler:^(BOOL success) {
                    if (success) {
                        [self sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] :command];
                    }else{
                        [self sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR] :command];
                    }
                }];
#endif
            }else{
                [[UIApplication sharedApplication] openURL: [NSURL URLWithString: UIApplicationOpenSettingsURLString]];
                [self sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] :command];
            }
        }else{
            [self sendPluginError:@"Not supported below iOS 8":command];
        }
    }
    @catch (NSException *exception) {
        [self handlePluginException:exception :command];
    }
}

#pragma mark - Background refresh
- (void) getBackgroundRefreshStatus: (CDVInvokedUrlCommand*)command
{
    UIBackgroundRefreshStatus _status;
    @try {
        // Must run on UI thread
        _status = [[UIApplication sharedApplication] backgroundRefreshStatus];
    }@catch (NSException *exception) {
        [self handlePluginException:exception :command];
    }
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status;
            
            if (_status == UIBackgroundRefreshStatusAvailable) {
                status = AUTHORIZATION_GRANTED;
                [self logDebug:@"Background updates are available for the app."];
            }else if(_status == UIBackgroundRefreshStatusDenied){
                status = AUTHORIZATION_DENIED;
                [self logDebug:@"The user explicitly disabled background behavior for this app or for the whole system."];
            }else if(_status == UIBackgroundRefreshStatusRestricted){
                status = @"restricted";
                [self logDebug:@"Background updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user."];
            }
            [self sendPluginResultString:status:command];
        }
        @catch (NSException *exception) {
            [self handlePluginException:exception :command];
        }
    }];
}


/********************************/
#pragma mark - Internal functions
/********************************/

- (void)pluginInitialize {

    [super pluginInitialize];

    diagnostic = self;

    self.debugEnabled = false;
    self.osVersion = [[[UIDevice currentDevice] systemVersion] floatValue];
}

// https://stackoverflow.com/a/38441011/777265
- (void) getArchitecture: (CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* cpuArch = UNKNOWN;
            
            size_t size;
            cpu_type_t type;
            cpu_subtype_t subtype;
            size = sizeof(type);
            sysctlbyname("hw.cputype", &type, &size, NULL, 0);
            
            size = sizeof(subtype);
            sysctlbyname("hw.cpusubtype", &subtype, &size, NULL, 0);
            
            // values for cputype and cpusubtype defined in mach/machine.h
            if (type == CPU_TYPE_X86_64) {
                cpuArch = CPU_ARCH_X86_64;
            } else if (type == CPU_TYPE_X86) {
                cpuArch = CPU_ARCH_X86;
            } else if (type == CPU_TYPE_ARM64) {
                cpuArch = CPU_ARCH_ARMv8;
            } else if (type == CPU_TYPE_ARM) {
                switch(subtype){
                    case CPU_SUBTYPE_ARM_V6:
                        cpuArch = CPU_ARCH_ARMv6;
                        break;
                    case CPU_SUBTYPE_ARM_V7:
                        cpuArch = CPU_ARCH_ARMv7;
                        break;
                    case CPU_SUBTYPE_ARM_V8:
                        cpuArch = CPU_ARCH_ARMv8;
                        break;
                }
            }
            [self logDebug:[NSString stringWithFormat:@"Current CPU architecture: %@", cpuArch]];
            [self sendPluginResultString:cpuArch:command];
        }@catch (NSException *exception) {
            [self handlePluginException:exception :command];
        }
    }];
}


/********************************/
#pragma mark - Send results
/********************************/

- (void) sendPluginResult: (CDVPluginResult*)result :(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) sendPluginResultBool: (BOOL)result :(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult;
    if(result) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:1];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:0];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) sendPluginResultString: (NSString*)result :(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) sendPluginError: (NSString*) errorMessage :(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMessage];
    [self logError:errorMessage];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) handlePluginException: (NSException*) exception :(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:exception.reason];
    [self logError:[NSString stringWithFormat:@"EXCEPTION: %@", exception.reason]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)executeGlobalJavascript: (NSString*)jsString
{
    [self.commandDelegate evalJs:jsString];
}

- (NSString*) arrayToJsonString:(NSArray*)inputArray
{
    NSError* error;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:inputArray options:NSJSONWritingPrettyPrinted error:&error];
    NSString* jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    return jsonString;
}

- (NSString*) objectToJsonString:(NSDictionary*)inputObject
{
    NSError* error;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:inputObject options:NSJSONWritingPrettyPrinted error:&error];
    NSString* jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    return jsonString;
}

- (NSArray*) jsonStringToArray:(NSString*)jsonStr
{
    NSError* error = nil;
    NSArray* array = [NSJSONSerialization JSONObjectWithData:[jsonStr dataUsingEncoding:NSUTF8StringEncoding] options:kNilOptions error:&error];
    if (error != nil){
        array = nil;
    }
    return array;
}

- (NSDictionary*) jsonStringToDictionary:(NSString*)jsonStr
{
    return (NSDictionary*) [self jsonStringToArray:jsonStr];
}

- (bool)isNull: (NSString*)str
{
    return str == nil || str == (id)[NSNull null] || str.length == 0 || [str isEqual: @"<null>"];
}


/********************************/
#pragma mark - utility functions
/********************************/

- (void)logDebug: (NSString*)msg
{
    if(self.debugEnabled){
        NSLog(@"%@: %@", LOG_TAG, msg);
        NSString* jsString = [NSString stringWithFormat:@"console.log(\"%@: %@\")", LOG_TAG, [self escapeDoubleQuotes:msg]];
        [self executeGlobalJavascript:jsString];
    }
}

- (void)logError: (NSString*)msg
{
    NSLog(@"%@ ERROR: %@", LOG_TAG, msg);
    if(self.debugEnabled){
        NSString* jsString = [NSString stringWithFormat:@"console.error(\"%@: %@\")", LOG_TAG, [self escapeDoubleQuotes:msg]];
        [self executeGlobalJavascript:jsString];
    }
}

- (NSString*)escapeDoubleQuotes: (NSString*)str
{
    NSString *result =[str stringByReplacingOccurrencesOfString: @"\"" withString: @"\\\""];
    return result;
}

- (void) setSetting: (NSString*)key forValue:(id)value
{
    [[NSUserDefaults standardUserDefaults] setObject:value forKey:key];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (id) getSetting: (NSString*) key
{
    return [[NSUserDefaults standardUserDefaults] objectForKey:key];
}

@end


