/*
 *  Diagnostic.h
 *  Diagnostic Plugin - Core Module
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import <WebKit/WebKit.h>

#import <mach/machine.h>
#import <sys/types.h>
#import <sys/sysctl.h>

// Public constants
extern NSString*const UNKNOWN;

extern NSString*const AUTHORIZATION_NOT_DETERMINED;
extern NSString*const AUTHORIZATION_DENIED;
extern NSString*const AUTHORIZATION_GRANTED;

@interface Diagnostic : CDVPlugin

@property (nonatomic) float osVersion;
@property (nonatomic) BOOL debugEnabled;

// Plugin API
- (void) enableDebug: (CDVInvokedUrlCommand*)command;
- (void) switchToSettings: (CDVInvokedUrlCommand*)command;
- (void) getBackgroundRefreshStatus: (CDVInvokedUrlCommand*)command;
- (void) getArchitecture: (CDVInvokedUrlCommand*)command;

// Utilities
+ (id) getInstance;
- (void) sendPluginResult: (CDVPluginResult*)result :(CDVInvokedUrlCommand*)command;
- (void) sendPluginResultBool: (BOOL)result :(CDVInvokedUrlCommand*)command;
- (void) sendPluginResultString: (NSString*)result :(CDVInvokedUrlCommand*)command;
- (void) sendPluginError: (NSString*) errorMessage :(CDVInvokedUrlCommand*)command;
- (void) handlePluginException: (NSException*) exception :(CDVInvokedUrlCommand*)command;
- (void)executeGlobalJavascript: (NSString*)jsString;
- (NSString*) arrayToJsonString:(NSArray*)inputArray;
- (NSString*) objectToJsonString:(NSDictionary*)inputObject;
- (NSArray*) jsonStringToArray:(NSString*)jsonStr;
- (NSDictionary*) jsonStringToDictionary:(NSString*)jsonStr;
- (bool)isNull: (NSString*)str;
- (void)logDebug: (NSString*)msg;
- (void)logError: (NSString*)msg;
- (NSString*)escapeDoubleQuotes: (NSString*)str;
- (void) setSetting: (NSString*)key forValue:(id)value;
- (id) getSetting: (NSString*) key;

@end
