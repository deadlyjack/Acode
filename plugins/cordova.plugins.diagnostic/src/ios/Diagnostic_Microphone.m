/*
 *  Diagnostic_Microphone.m
 *  Diagnostic Plugin - Microphone Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Microphone.h"

@implementation Diagnostic_Microphone

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Microphone[native]";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];
}

/********************************/
#pragma mark - Plugin API
/********************************/

- (void) isMicrophoneAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult;
        @try {
#ifdef __IPHONE_8_0
            AVAudioSessionRecordPermission recordPermission = [AVAudioSession sharedInstance].recordPermission;

            if(recordPermission == AVAudioSessionRecordPermissionGranted) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:1];
            }
            else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:0];
            }
            [diagnostic sendPluginResultBool:recordPermission == AVAudioSessionRecordPermissionGranted :command];
#else
            [diagnostic sendPluginError:@"Only supported on iOS 8 and higher":command];
#endif
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        };
    }];
}

- (void) getMicrophoneAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
#ifdef __IPHONE_8_0
            NSString* status;
            AVAudioSessionRecordPermission recordPermission = [AVAudioSession sharedInstance].recordPermission;
            switch(recordPermission){
                case AVAudioSessionRecordPermissionDenied:
                    status = AUTHORIZATION_DENIED;
                    break;
                case AVAudioSessionRecordPermissionGranted:
                    status = AUTHORIZATION_GRANTED;
                    break;
                case AVAudioSessionRecordPermissionUndetermined:
                    status = AUTHORIZATION_NOT_DETERMINED;
                    break;
            }

            [diagnostic logDebug:[NSString stringWithFormat:@"Microphone authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];
#else
            [diagnostic sendPluginError:@"Only supported on iOS 8 and higher":command];
#endif
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestMicrophoneAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [[AVAudioSession sharedInstance] requestRecordPermission:^(BOOL granted) {
                [diagnostic logDebug:[NSString stringWithFormat:@"Has access to microphone: %d", granted]];
                [diagnostic sendPluginResultBool:granted :command];
            }];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

/********************************/
#pragma mark - Internals
/********************************/

@end
