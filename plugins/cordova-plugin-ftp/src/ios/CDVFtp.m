/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "GRRequestsManager.h"
#import "GRListingRequest.h"
#import "CDVFtp.h"

@interface CDVFtp () <GRRequestsManagerDelegate>

@property (nonatomic, strong) GRRequestsManager *requestsManager;
@property (nonatomic, strong) NSString *hostname;
@property (nonatomic, strong) NSString *username;
@property (nonatomic, strong) NSString *password;

@property (nonatomic, strong) CDVPluginResult* pluginResult;
@property (nonatomic, strong) CDVInvokedUrlCommand* cmd;


@end

@implementation CDVFtp

- (void)connect:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    self.hostname = [cmd.arguments objectAtIndex:0];
    self.username = [cmd.arguments objectAtIndex:1];
    self.password = [cmd.arguments objectAtIndex:2];

    // Warning: we won't reset login info when request fail, this may be not good, but don't care now.
    if (self.hostname == nil || self.hostname.length <= 0)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    else
    {
        if (self.username == nil && self.password == nil)
        {
            self.username = @"anonymous";
            self.password = @"anonymous@";
        }

        NSArray* address = [self.hostname componentsSeparatedByString:NSLocalizedString(@":", nil)];
        if ([address count] == 2) {
            NSString* host = [address objectAtIndex:0];
            NSNumber* port = [NSNumber numberWithInt:[[address objectAtIndex:1] intValue]];
            self.requestsManager = [[GRRequestsManager alloc] initWithHostname:host
                                                                          port:port
                                                                          user:self.username
                                                                      password:self.password];
        } else {
            self.requestsManager = [[GRRequestsManager alloc] initWithHostname:self.hostname
                                                                          user:self.username
                                                                      password:self.password];
        }
        self.requestsManager.delegate = self;

        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Init connect and login OK. (iOS always succeed)"];
    }

    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)list:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    NSString* path = [cmd.arguments objectAtIndex:0];

    if (path == nil)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Expected path."];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:cmd.callbackId];
    }
    else
    {
        if ([path characterAtIndex:path.length - 1] != '/')
        {
            path = [path stringByAppendingString:@"/"];
        }

        [self.requestsManager addRequestForListDirectoryAtPath:path];
        [self.requestsManager startProcessingRequests];
        [self.pluginResult setKeepCallbackAsBool:YES];
    }
}

- (void)createDirectory:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    NSString* path = [cmd.arguments objectAtIndex:0];

    if (path == nil)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Expected path."];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:cmd.callbackId];
    }
    else
    {
        if ([path characterAtIndex:path.length - 1] != '/')
        {
            path = [path stringByAppendingString:@"/"];
        }

        [self.requestsManager addRequestForCreateDirectoryAtPath:path];
        [self.requestsManager startProcessingRequests];
        [self.pluginResult setKeepCallbackAsBool:YES];
    }
}

- (void)deleteDirectory:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    NSString* path = [cmd.arguments objectAtIndex:0];

    if (path == nil)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Expected path."];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:cmd.callbackId];
    }
    else
    {
        if ([path characterAtIndex:path.length - 1] != '/')
        {
            path = [path stringByAppendingString:@"/"];
        }

        [self.requestsManager addRequestForDeleteDirectoryAtPath:path];
        [self.requestsManager startProcessingRequests];
        [self.pluginResult setKeepCallbackAsBool:YES];
    }
}

- (void)deleteFile:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    NSString* path = [cmd.arguments objectAtIndex:0];

    if (path == nil)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Expected file."];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:cmd.callbackId];
    }
    else
    {
        [self.requestsManager addRequestForDeleteFileAtPath:path];
        [self.requestsManager startProcessingRequests];
        [self.pluginResult setKeepCallbackAsBool:YES];
    }
}

- (void)uploadFile:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    NSString* localPath = [cmd.arguments objectAtIndex:0];
    NSString* remotePath = [cmd.arguments objectAtIndex:1];

    if ([localPath length] == 0 || [remotePath length] == 0)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Expected localFile and remoteFile."];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:cmd.callbackId];
    }
    else
    {
        [self.requestsManager addRequestForUploadFileAtLocalPath:localPath toRemotePath:remotePath];
        [self.requestsManager startProcessingRequests];
        [self.pluginResult setKeepCallbackAsBool:YES];
    }
}

- (void)downloadFile:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;
    NSString* localPath = [cmd.arguments objectAtIndex:0];
    NSString* remotePath = [cmd.arguments objectAtIndex:1];

    if ([localPath length] == 0 || [remotePath length] == 0)
    {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Expected localFile and remoteFile."];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:cmd.callbackId];
    }
    else
    {
        [self.requestsManager addRequestForDownloadFileAtRemotePath:remotePath toLocalPath:localPath];
        [self.requestsManager startProcessingRequests];
        [self.pluginResult setKeepCallbackAsBool:YES];
    }
}

- (void)cancelAllRequests:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;

    [self.requestsManager stopAndCancelAllRequests];

    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Cancel OK."];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)disconnect:(CDVInvokedUrlCommand*)cmd
{
    self.cmd = cmd;

    // Reuse cancel action
    [self.requestsManager stopAndCancelAllRequests];

    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Disconnect OK."];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

#pragma mark - GRRequestsManagerDelegate

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didScheduleRequest:(id<GRRequestProtocol>)request
{
    NSLog(@"requestsManager:didScheduleRequest:");
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [self.pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

/*
 * Refer to [Apple CF doc](https://developer.apple.com/library/mac/documentation/CoreFoundation/Reference/CFFTPStreamRef/index.html#//apple_ref/doc/uid/TP40003359-CH3-205971)
 *  for all available file fields, e.g. `kCFFTPResourceName`, `kCFFTPResourceType`, `kCFFTPResourceLink`, `kCFFTPResourceSize`, `kCFFTPResourceModDate`...
 * Refer to [Apple dirent doc](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/dirent.5.html)
 *  for all available file type `kCFFTPResourceType`.
 * Here, we rename some field's key and value for platform compatibility.
 */
- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didCompleteListingRequest:(id<GRRequestProtocol>)request listing:(NSArray *)listing
{
    NSMutableArray* newFilesInfo = [[NSMutableArray alloc] init];
    for (NSDictionary* file in ((GRListingRequest *)request).filesInfo) {
        NSMutableDictionary* newFile = [[NSMutableDictionary alloc] init];
        // file name
        NSString* name = [file objectForKey:(id)kCFFTPResourceName];
        NSData* nameData = [name dataUsingEncoding:NSMacOSRomanStringEncoding];
        name = [[NSString alloc] initWithData:nameData encoding:NSUTF8StringEncoding];
        [newFile setObject:name forKey:@"name"];
        // file type
        NSNumber* type = [file objectForKey:(id)kCFFTPResourceType];
        if ([type intValue] == 8) {
            // regular file
            [newFile setObject:[NSNumber numberWithInt:0] forKey:@"type"];
        } else if ([type intValue] == 4) {
            // directory
            [newFile setObject:[NSNumber numberWithInt:1] forKey:@"type"];
        } else if ([type intValue] == 10) {
            // symbolic link
            [newFile setObject:[NSNumber numberWithInt:2] forKey:@"type"];
        } else {
            // other files, like char dev, block dev, fifo dev, socket dev... are all treated as unknown type
            [newFile setObject:[NSNumber numberWithInt:-1] forKey:@"type"];
        }
        // symbolic link information (if the file is a symbolic link)
        NSString* link = [file objectForKey:(id)kCFFTPResourceLink];
        NSData* linkData = [link dataUsingEncoding:NSMacOSRomanStringEncoding];
        link = [[NSString alloc] initWithData:linkData encoding:NSUTF8StringEncoding];
        [newFile setObject:link forKey:@"link"];
        // file size
        NSNumber* size = [file objectForKey:(id)kCFFTPResourceSize];
        [newFile setObject:size forKey:@"size"];
        // modified date
        NSDate* modifiedDate = [file objectForKey:(id)kCFFTPResourceModDate];
        NSDateFormatter* dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss zzz"];
        NSString* modifiedDateString = [dateFormatter stringFromDate:modifiedDate];
        [newFile setObject:modifiedDateString forKey:@"modifiedDate"];
        // Add this file to file list
        [newFilesInfo addObject:newFile];
    }
    //NSLog(@"requestsManager:didCompleteListingRequest:listing: \n%@", listing);
    NSLog(@"requestsManager:didCompleteListingRequest:newFilesInfo: \n%@", newFilesInfo);
    // Return all files info, not just name list.
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:newFilesInfo];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didCompleteCreateDirectoryRequest:(id<GRRequestProtocol>)request
{
    NSLog(@"requestsManager:didCompleteCreateDirectoryRequest: Create directory OK");
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Create directory OK"];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didCompleteDeleteRequest:(id<GRRequestProtocol>)request
{
    NSLog(@"requestsManager:didCompleteDeleteRequest: Delete file/directory OK");
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"Delete file/directory OK"];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didCompletePercent:(float)percent forRequest:(id<GRRequestProtocol>)request
{
    NSLog(@"requestsManager:didCompletePercent:forRequest: %f", percent);
    if (percent >= 0 && percent < 1) {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:percent];
        [self.pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
    }
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didCompleteUploadRequest:(id<GRDataExchangeRequestProtocol>)request
{
    NSLog(@"requestsManager:didCompleteUploadRequest: Upload OK");
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:1];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didCompleteDownloadRequest:(id<GRDataExchangeRequestProtocol>)request
{
    NSLog(@"requestsManager:didCompleteDownloadRequest: Download OK");
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:1];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didFailWritingFileAtPath:(NSString *)path forRequest:(id<GRDataExchangeRequestProtocol>)request error:(NSError *)error
{
    NSLog(@"requestsManager:didFailWritingFileAtPath:forRequest:error: \n %@", error);
    NSString* errorMsg = nil;
    if ([error userInfo] == nil || (errorMsg = [[error userInfo] valueForKey:@"message"]) == nil) {
        errorMsg = [error localizedDescription];
    }
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMsg];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

- (void)requestsManager:(id<GRRequestsManagerProtocol>)requestsManager didFailRequest:(id<GRRequestProtocol>)request withError:(NSError *)error
{
    NSLog(@"requestsManager:didFailRequest:withError: \n %@", error);
    NSString* errorMsg = nil;
    if ([error userInfo] == nil || (errorMsg = [[error userInfo] valueForKey:@"message"]) == nil) {
        errorMsg = [error localizedDescription];
    }
    self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMsg];
    [self.pluginResult setKeepCallbackAsBool:NO];
    [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.cmd.callbackId];
}

@end
