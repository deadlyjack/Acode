//
//  GRUploadRequest.m
//  GoldRaccoon
//  v1.0.1
//
//  Created by Valentin Radu on 8/23/11.
//  Copyright 2011 Valentin Radu. All rights reserved.
//
//  Modified and/or redesigned by Lloyd Sargent to be ARC compliant.
//  Copyright 2012 Lloyd Sargent. All rights reserved.
//
//  Modified and redesigned by Alberto De Bortoli.
//  Copyright 2013 Alberto De Bortoli. All rights reserved.
//

#import "GRUploadRequest.h"
#import "GRListingRequest.h"

@interface GRUploadRequest () <GRRequestDelegate, GRRequestDataSource>

@property (nonatomic, assign) long bytesIndex;
@property (nonatomic, assign) long bytesRemaining;
@property (nonatomic, strong) NSData *sentData;
@property (nonatomic, strong) GRListingRequest *listingRequest;

@end

@implementation GRUploadRequest

@synthesize localFilePath = _localFilePath;
@synthesize fullRemotePath = _fullRemotePath;

- (void)start
{
    self.maximumSize = LONG_MAX;
    self.bytesIndex = 0;
    self.bytesRemaining = 0;
    
    if ([self.dataSource respondsToSelector:@selector(dataForUploadRequest:)] == NO) {
        [self.streamInfo streamError:self errorCode:kGRFTPClientMissingRequestDataAvailable];
        return;
    }
    
    // we first list the directory to see if our folder is up on the server
    self.listingRequest = [[GRListingRequest alloc] initWithDelegate:self datasource:self];
	self.listingRequest.passiveMode = self.passiveMode;
    self.listingRequest.path = [[self.path stringByDeletingLastPathComponent] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    [self.listingRequest start];
}

#pragma mark - GRRequestDelegate

- (void)requestCompleted:(GRRequest *)request
{
    NSString *fileName = [[self.path lastPathComponent] stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"/"]];
    
    if ([self.listingRequest fileExists:fileName]) {
        if ([self.delegate shouldOverwriteFile:self.path forRequest:self] == NO) {
            // perform callbacks and close out streams
            [self.streamInfo streamError:self errorCode:kGRFTPClientFileAlreadyExists];
            return;
        }
    }
    
    if ([self.dataSource respondsToSelector:@selector(dataSizeForUploadRequest:)]) {
        self.maximumSize = [self.dataSource dataSizeForUploadRequest:self];
    }
    
    // open the write stream and check for errors calling delegate methods
    // if things fail. This encapsulates the streamInfo object and cleans up our code.
    [self.streamInfo openWrite:self];
}

- (void)requestFailed:(GRRequest *)request
{
    [self.delegate requestFailed:request];
}

- (BOOL)shouldOverwriteFile:(NSString *)filePath forRequest:(id<GRDataExchangeRequestProtocol>)request
{
    return [self.delegate shouldOverwriteFile:filePath forRequest:request];
}

#pragma mark - GRRequestDataSource

- (NSString *)hostnameForRequest:(id<GRRequestProtocol>)request
{
    return [self.dataSource hostnameForRequest:request];
}

- (NSString *)usernameForRequest:(id<GRRequestProtocol>)request
{
    return [self.dataSource usernameForRequest:request];
}

- (NSString *)passwordForRequest:(id<GRRequestProtocol>)request
{
    return [self.dataSource passwordForRequest:request];
}

#pragma mark - NSStreamDelegate

- (void)stream:(NSStream *)theStream handleEvent:(NSStreamEvent)streamEvent
{
    // see if we have cancelled the runloop
    if ([self.streamInfo checkCancelRequest:self]) {
        return;
    }
    
    switch (streamEvent) {
        case NSStreamEventOpenCompleted: {
            self.didOpenStream = YES;
            self.streamInfo.bytesTotal = 0;
            break;
        }
            
        case NSStreamEventHasBytesAvailable:
        break;
            
        case NSStreamEventHasSpaceAvailable: {
            if (self.bytesRemaining == 0) {
                if ([self.dataSource respondsToSelector:@selector(dataForUploadRequest:)]) {
                    self.sentData = [self.dataSource dataForUploadRequest:self];
                }
                else {
                    return;
                }
                self.bytesRemaining = [_sentData length];
                self.bytesIndex = 0;
                
                // we are done
                if (self.sentData == nil) {
                    [self.streamInfo streamComplete:self]; // perform callbacks and close out streams
                    return;
                }
            }
            
            NSUInteger nextPackageLength = MIN(kGRDefaultBufferSize, self.bytesRemaining);
            NSRange range = NSMakeRange(self.bytesIndex, nextPackageLength);
            NSData *packetToSend = [self.sentData subdataWithRange: range];

            [self.streamInfo write:self data: packetToSend];
            
            self.bytesIndex += self.streamInfo.bytesThisIteration;
            self.bytesRemaining -= self.streamInfo.bytesThisIteration;
            break;
        }
            
        case NSStreamEventErrorOccurred: {
            // perform callbacks and close out streams
            [self.streamInfo streamError:self errorCode:[GRError errorCodeWithError:[theStream streamError]]];
            break;
        }
            
        case NSStreamEventEndEncountered: {
            // perform callbacks and close out streams
            [self.streamInfo streamError:self errorCode:kGRFTPServerAbortedTransfer];
            break;
        }
        
        default:
            break;
    }
}

- (NSString *)fullRemotePath
{
    return [[self fullURL] absoluteString];
}

@end
