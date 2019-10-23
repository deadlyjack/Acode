/*
 *  Diagnostic_Camera.m
 *  Diagnostic Plugin - Camera Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Camera.h"


@implementation Diagnostic_Camera

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Camera[native]";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];
}

/********************************/
#pragma mark - Plugin API
/********************************/

- (void) isCameraAvailable: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[self isCameraPresent] && [self isCameraAuthorized] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isCameraPresent: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[self isCameraPresent] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isCameraAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[self isCameraAuthorized] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) getCameraAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status;
            AVAuthorizationStatus authStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];

            if(authStatus == AVAuthorizationStatusDenied || authStatus == AVAuthorizationStatusRestricted){
                status = AUTHORIZATION_DENIED;
            }else if(authStatus == AVAuthorizationStatusNotDetermined){
                status = AUTHORIZATION_NOT_DETERMINED;
            }else if(authStatus == AVAuthorizationStatusAuthorized){
                status = AUTHORIZATION_GRANTED;
            }
            [diagnostic logDebug:[NSString stringWithFormat:@"Camera authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestCameraAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
                [diagnostic sendPluginResultBool:granted :command];
            }];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isCameraRollAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [diagnostic sendPluginResultBool:[[self getCameraRollAuthorizationStatus]  isEqual: AUTHORIZATION_GRANTED] :command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) getCameraRollAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status = [self getCameraRollAuthorizationStatus];
            [diagnostic logDebug:[NSString stringWithFormat:@"Camera Roll authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestCameraRollAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus authStatus) {
                NSString* status = [self getCameraRollAuthorizationStatusAsString:authStatus];
                [diagnostic sendPluginResultString:status:command];
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

- (BOOL) isCameraPresent
{
    BOOL cameraAvailable =
    [UIImagePickerController
     isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera];
    if(cameraAvailable) {
        [diagnostic logDebug:@"Camera available"];
        return true;
    }
    else {
        [diagnostic logDebug:@"Camera unavailable"];
        return false;
    }
}

- (BOOL) isCameraAuthorized
{
    AVAuthorizationStatus authStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    if(authStatus == AVAuthorizationStatusAuthorized) {
        return true;
    } else {
        return false;
    }
}

- (NSString*) getCameraRollAuthorizationStatus
{
    PHAuthorizationStatus authStatus = [PHPhotoLibrary authorizationStatus];
    return [self getCameraRollAuthorizationStatusAsString:authStatus];

}

- (NSString*) getCameraRollAuthorizationStatusAsString: (PHAuthorizationStatus)authStatus
{
    NSString* status;
    if(authStatus == PHAuthorizationStatusDenied || authStatus == PHAuthorizationStatusRestricted){
        status = AUTHORIZATION_DENIED;
    }else if(authStatus == PHAuthorizationStatusNotDetermined ){
        status = AUTHORIZATION_NOT_DETERMINED;
    }else if(authStatus == PHAuthorizationStatusAuthorized){
        status = AUTHORIZATION_GRANTED;
    }
    return status;
}
@end
