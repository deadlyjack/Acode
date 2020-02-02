//
//  GRStreamInfo.h
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

#import "GRError.h"

#define kGRDefaultBufferSize 32768

@protocol GRRequestProtocol;

@interface GRStreamInfo : NSObject

@property (nonatomic, strong) NSOutputStream *writeStream;
@property (nonatomic, strong) NSInputStream *readStream;

@property (nonatomic, assign) long bytesThisIteration;
@property (nonatomic, assign) long bytesTotal;
@property (nonatomic, assign) long timeout;
@property (nonatomic, assign) BOOL cancelRequestFlag;
@property (nonatomic, assign) BOOL cancelDoesNotCallDelegate;

- (void)openRead:(id<GRRequestProtocol>)request;
- (void)openWrite:(id<GRRequestProtocol>)request;
- (BOOL)checkCancelRequest:(id<GRRequestProtocol>)request;
- (NSData *)read:(id<GRRequestProtocol>)request;
- (BOOL)write:(id<GRRequestProtocol>)request data:(NSData *)data;
- (void)streamError:(id<GRRequestProtocol>)request errorCode:(enum GRErrorCodes)errorCode;
- (void)streamComplete:(id<GRRequestProtocol>)request;
- (void)close:(id<GRRequestProtocol>)request;

@end
