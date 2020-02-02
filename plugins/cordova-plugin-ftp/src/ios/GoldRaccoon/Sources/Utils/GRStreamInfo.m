//
//  GRStreamInfo.m
//  GoldRaccoon
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

#import "GRStreamInfo.h"
#import "GRRequest.h"

@implementation GRStreamInfo
{
    dispatch_queue_t _queue;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _writeStream = nil;
        _readStream = nil;
        _bytesThisIteration = 0;
        _bytesTotal = 0;
        _timeout = 30;
        _cancelRequestFlag = NO;
        _cancelDoesNotCallDelegate = NO;
        _queue = dispatch_queue_create("com.albertodebortoli.goldraccoon.streaminfo", DISPATCH_QUEUE_CONCURRENT);
    }

    return self;
}

- (void)openRead:(GRRequest *)request
{
    if ([request.dataSource hostnameForRequest:request] == nil) {
        request.error = [[GRError alloc] init];
        request.error.errorCode = kGRFTPClientHostnameIsNil;
        [request.delegate requestFailed:request];
        [request.streamInfo close:request];
        return;
    }

    // a little bit of C because I was not able to make NSInputStream play nice
    CFReadStreamRef readStreamRef = CFReadStreamCreateWithFTPURL(NULL, ( __bridge CFURLRef) request.fullURL);
    // FIXME: property port is not supported!
    //CFReadStreamSetProperty(readStreamRef,
                            //socketRemotePortNumber,
                            //(__bridge CFNumberRef) [request.dataSource portForRequest:request]);
    CFReadStreamSetProperty(readStreamRef,
                            kCFStreamPropertyFTPAttemptPersistentConnection,
                            kCFBooleanFalse);

    CFReadStreamSetProperty(readStreamRef, kCFStreamPropertyShouldCloseNativeSocket, kCFBooleanTrue);
	CFReadStreamSetProperty(readStreamRef, kCFStreamPropertyFTPUsePassiveMode, request.passiveMode ? kCFBooleanTrue :kCFBooleanFalse);
    CFReadStreamSetProperty(readStreamRef, kCFStreamPropertyFTPFetchResourceInfo, kCFBooleanTrue);
    CFReadStreamSetProperty(readStreamRef, kCFStreamPropertyFTPUserName, (__bridge CFStringRef) [request.dataSource usernameForRequest:request]);
    CFReadStreamSetProperty(readStreamRef, kCFStreamPropertyFTPPassword, (__bridge CFStringRef) [request.dataSource passwordForRequest:request]);
    self.readStream = ( __bridge_transfer NSInputStream *) readStreamRef;

    if (self.readStream == nil) {
        request.error = [[GRError alloc] init];
        request.error.errorCode = kGRFTPClientCantOpenStream;
        [request.delegate requestFailed:request];
        [request.streamInfo close:request];
        return;
    }

    self.readStream.delegate = request;
	[self.readStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
	[self.readStream open];

    request.didOpenStream = NO;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, self.timeout * NSEC_PER_SEC), _queue, ^{
        if (!request.didOpenStream && request.error == nil) {
            request.error = [[GRError alloc] init];
            request.error.errorCode = kGRFTPClientStreamTimedOut;
            [request.delegate requestFailed:request];
            [request.streamInfo close:request];
        }
    });
}

- (void)openWrite:(GRRequest *)request
{
    if ([request.dataSource hostnameForRequest:request] == nil) {
        request.error = [[GRError alloc] init];
        request.error.errorCode = kGRFTPClientHostnameIsNil;
        [request.delegate requestFailed:request];
        [request.streamInfo close:request];
        return;
    }

    CFWriteStreamRef writeStreamRef = CFWriteStreamCreateWithFTPURL(NULL, ( __bridge CFURLRef) request.fullURL);
    // FIXME: property port is not supported!
    //CFWriteStreamSetProperty(writeStreamRef,
                            //socketRemotePortNumber,
                            //(__bridge CFNumberRef) [request.dataSource portForRequest:request]);
    CFWriteStreamSetProperty(writeStreamRef,
                             kCFStreamPropertyFTPAttemptPersistentConnection,
                             kCFBooleanFalse);

    CFWriteStreamSetProperty(writeStreamRef, kCFStreamPropertyShouldCloseNativeSocket, kCFBooleanTrue);
	CFWriteStreamSetProperty(writeStreamRef, kCFStreamPropertyFTPUsePassiveMode, request.passiveMode ? kCFBooleanTrue :kCFBooleanFalse);
    CFWriteStreamSetProperty(writeStreamRef, kCFStreamPropertyFTPFetchResourceInfo, kCFBooleanTrue);
    CFWriteStreamSetProperty(writeStreamRef, kCFStreamPropertyFTPUserName, (__bridge CFStringRef) [request.dataSource usernameForRequest:request]);
    CFWriteStreamSetProperty(writeStreamRef, kCFStreamPropertyFTPPassword, (__bridge CFStringRef) [request.dataSource passwordForRequest:request]);

    self.writeStream = ( __bridge_transfer NSOutputStream *) writeStreamRef;

    if (!self.writeStream) {
        request.error = [[GRError alloc] init];
        request.error.errorCode = kGRFTPClientCantOpenStream;
        [request.delegate requestFailed:request];
        [request.streamInfo close:request];
        return;
    }

    self.writeStream.delegate = request;
    [self.writeStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    [self.writeStream open];

    request.didOpenStream = NO;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, self.timeout * NSEC_PER_SEC), _queue, ^{
        if (!request.didOpenStream && (request.error == nil)) {
            request.error = [[GRError alloc] init];
            request.error.errorCode = kGRFTPClientStreamTimedOut;
            [request.delegate requestFailed:request];
            [request.streamInfo close:request];
        }
    });
}

- (BOOL)checkCancelRequest:(GRRequest *)request
{
    if (!self.cancelRequestFlag) {
        return NO;
    }

    // see if we don't want to call the delegate (set and forget)
    if (!self.cancelDoesNotCallDelegate) {
        [request.delegate requestCompleted:request];
    }

    [request.streamInfo close:request];

    return YES;
}

- (NSData *)read:(GRRequest *)request
{
    NSData *data;
    NSMutableData *bufferObject = [NSMutableData dataWithLength:kGRDefaultBufferSize];

    self.bytesThisIteration = [self.readStream read:(UInt8 *)[bufferObject bytes] maxLength:kGRDefaultBufferSize];
    self.bytesTotal += self.bytesThisIteration;

    // return the data
    if (self.bytesThisIteration > 0) {
        data = [NSData dataWithBytes:(UInt8 *)[bufferObject bytes] length:self.bytesThisIteration];
        request.percentCompleted = self.bytesTotal / request.maximumSize;

        if ([request.delegate respondsToSelector:@selector(percentCompleted:forRequest:)]) {
            [request.delegate percentCompleted:request.percentCompleted forRequest:request];
        }

        return data;
    }

    // return no data, but this isn't an error... just the end of the file
    else if (self.bytesThisIteration == 0) {
        return [NSData data]; // returns empty data object - means no error, but no data
    }

    // otherwise we had an error, return an error
    [self streamError:request errorCode:kGRFTPClientCantReadStream];

    return nil;
}

- (BOOL)write:(GRRequest *)request data:(NSData *)data
{
    self.bytesThisIteration = [self.writeStream write:[data bytes] maxLength:[data length]];
    self.bytesTotal += self.bytesThisIteration;

    if (self.bytesThisIteration > 0) {
        request.percentCompleted = self.bytesTotal / request.maximumSize;
        if ([request.delegate respondsToSelector:@selector(percentCompleted:forRequest:)]) {
            [request.delegate percentCompleted:request.percentCompleted forRequest:request];
        }

        return YES;
    }

    if (self.bytesThisIteration == 0) {
        return YES;
    }

    [self streamError:request errorCode:kGRFTPClientCantWriteStream]; // perform callbacks and close out streams

    return NO;
}

- (void)streamError:(GRRequest *)request errorCode:(enum GRErrorCodes)errorCode
{
    request.error = [[GRError alloc] init];
    request.error.errorCode = errorCode;
    [request.delegate requestFailed:request];
    [request.streamInfo close:request];
}

- (void)streamComplete:(GRRequest *)request
{
    [request.delegate requestCompleted:request];
    [request.streamInfo close:request];
}

- (void)close:(GRRequest *)request
{
    if (self.readStream) {
        [self.readStream close];
        [self.readStream removeFromRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
        self.readStream = nil;
    }

    if (self.writeStream) {
        [self.writeStream close];
        [self.writeStream removeFromRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
        self.writeStream = nil;
    }

    request.streamInfo = nil;
}

@end
