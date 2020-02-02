//
//  GRDownloadRequest.m
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

#import "GRDownloadRequest.h"

@interface GRDownloadRequest ()

@property (nonatomic, strong) NSData *receivedData;

@end

@implementation GRDownloadRequest

@synthesize localFilePath = _localFilePath;
@synthesize fullRemotePath = _fullRemotePath;

- (void)start
{
    if ([self.delegate respondsToSelector:@selector(dataAvailable:forRequest:)] == NO) {
        [self.streamInfo streamError:self errorCode:kGRFTPClientMissingRequestDataAvailable];
        return;
    }
    
    // open the read stream and check for errors calling delegate methods
    // if things fail. This encapsulates the streamInfo object and cleans up our code.
    [self.streamInfo openRead:self];
}

- (void)stream:(NSStream *)theStream handleEvent:(NSStreamEvent)streamEvent
{
    // see if we have cancelled the runloop
    if ([self.streamInfo checkCancelRequest:self]) {
        return;
    }
    
    switch (streamEvent) {
        case NSStreamEventOpenCompleted: {
            self.maximumSize = [[theStream propertyForKey:(id)kCFStreamPropertyFTPResourceSize] integerValue];
            self.didOpenStream = YES;
            self.streamInfo.bytesTotal = 0;
            self.receivedData = [NSMutableData data];
        } 
        break;
            
        case NSStreamEventHasBytesAvailable: {
            self.receivedData = [self.streamInfo read:self];
            
            if (self.receivedData) {
                if ([self.delegate respondsToSelector:@selector(dataAvailable:forRequest:)]) {
                    [self.delegate dataAvailable:self.receivedData forRequest:self];
                }
            }
            else {
                [self.streamInfo streamError:self errorCode:kGRFTPClientCantReadStream];
            }
        } 
        break;
            
        case NSStreamEventHasSpaceAvailable: {
            
        } 
        break;
            
        case NSStreamEventErrorOccurred: {
            [self.streamInfo streamError:self errorCode:[GRError errorCodeWithError:[theStream streamError]]];
        }
        break;
            
        case NSStreamEventEndEncountered: {
            [self.streamInfo streamComplete:self];
        }
        break;

        default:
            break;
    }
}

- (NSString *)fullRemotePath
{
    return [[self fullURL] absoluteString];
}

@end
