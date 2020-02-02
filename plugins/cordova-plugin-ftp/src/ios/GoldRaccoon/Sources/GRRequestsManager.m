//
//  GRRequestsManager.m
//  GoldRaccoon
//  v1.0.1
//
//  Created by Alberto De Bortoli on 14/06/2013.
//  Copyright 2013 Alberto De Bortoli. All rights reserved.
//

#import "GRRequestsManager.h"

#import "GRListingRequest.h"
#import "GRCreateDirectoryRequest.h"
#import "GRUploadRequest.h"
#import "GRDownloadRequest.h"
#import "GRDeleteRequest.h"

#import "GRQueue.h"

@interface GRRequestsManager () <GRRequestDelegate, GRRequestDataSource>

@property (nonatomic, copy) NSString *username;
@property (nonatomic, copy) NSString *password;
@property (nonatomic, strong) NSMutableData *currentDownloadData;
@property (nonatomic, strong) NSData *currentUploadData;
@property (nonatomic, strong) GRQueue *requestQueue;
@property (nonatomic, strong) GRRequest *currentRequest;
@property (nonatomic, assign) BOOL delegateRespondsToPercentProgress;
@property (nonatomic, assign) BOOL isRunning;

- (id<GRRequestProtocol>)_addRequestOfType:(Class)clazz withPath:(NSString *)filePath;
- (id<GRDataExchangeRequestProtocol>)_addDataExchangeRequestOfType:(Class)clazz withLocalPath:(NSString *)localPath remotePath:(NSString *)remotePath;
- (void)_enqueueRequest:(id<GRRequestProtocol>)request;
- (void)_processNextRequest;

@end

@implementation GRRequestsManager

@synthesize hostname = _hostname;
@synthesize port = _port;
@synthesize delegate = _delegate;

#pragma mark - Dealloc and Initialization

- (instancetype)init
{
    [self doesNotRecognizeSelector:_cmd];
    return nil;
}

- (instancetype)initWithHostname:(NSString *)hostname user:(NSString *)username password:(NSString *)password
{
    NSAssert([hostname length], @"hostname must not be nil");

    self = [super init];
    if (self) {
        _hostname = hostname;
        _username = username;
        _port = [NSNumber numberWithInt:21];
        _password = password;
        _requestQueue = [[GRQueue alloc] init];
        _isRunning = NO;
        _delegateRespondsToPercentProgress = NO;
    }
    return self;
}

- (instancetype)initWithHostname:(NSString *)hostname port:(NSNumber *)port user:(NSString *)username password:(NSString *)password
{
    NSAssert([hostname length], @"hostname must not be nil");

    self = [super init];
    if (self) {
        _hostname = hostname;
        _username = username;
        _port = port;
        _password = password;
        _requestQueue = [[GRQueue alloc] init];
        _isRunning = NO;
        _delegateRespondsToPercentProgress = NO;
    }
    return self;
}

- (void)dealloc
{
    [self stopAndCancelAllRequests];
}

#pragma mark - Setters

- (void)setDelegate:(id<GRRequestsManagerDelegate>)delegate
{
    if (_delegate != delegate) {
        _delegate = delegate;
        _delegateRespondsToPercentProgress = [_delegate respondsToSelector:@selector(requestsManager:didCompletePercent:forRequest:)];
    }
}

#pragma mark - Public Methods

- (void)startProcessingRequests
{
    if (_isRunning == NO) {
        _isRunning = YES;
        [self _processNextRequest];
    }
}

- (void)stopAndCancelAllRequests
{
    [self.requestQueue clear];
    self.currentRequest.cancelDoesNotCallDelegate = YES;
    [self.currentRequest cancelRequest];
    self.currentRequest = nil;
    _isRunning = NO;
}

- (BOOL)cancelRequest:(GRRequest *)request
{
    return [self.requestQueue removeObject:request];
}

- (NSUInteger)remainingRequests
{
    return [self.requestQueue count];
}

#pragma mark - FTP Actions

- (id<GRRequestProtocol>)addRequestForListDirectoryAtPath:(NSString *)path
{
    return [self _addRequestOfType:[GRListingRequest class] withPath:path];
}

- (id<GRRequestProtocol>)addRequestForCreateDirectoryAtPath:(NSString *)path
{
    return [self _addRequestOfType:[GRCreateDirectoryRequest class] withPath:path];
}

- (id<GRRequestProtocol>)addRequestForDeleteFileAtPath:(NSString *)filePath
{
    return [self _addRequestOfType:[GRDeleteRequest class] withPath:filePath];
}

- (id<GRRequestProtocol>)addRequestForDeleteDirectoryAtPath:(NSString *)path
{
    return [self _addRequestOfType:[GRDeleteRequest class] withPath:path];
}

- (id<GRDataExchangeRequestProtocol>)addRequestForDownloadFileAtRemotePath:(NSString *)remotePath toLocalPath:(NSString *)localPath
{
    return [self _addDataExchangeRequestOfType:[GRDownloadRequest class] withLocalPath:localPath remotePath:remotePath];
}

- (id<GRDataExchangeRequestProtocol>)addRequestForUploadFileAtLocalPath:(NSString *)localPath toRemotePath:(NSString *)remotePath
{
    return [self _addDataExchangeRequestOfType:[GRUploadRequest class] withLocalPath:localPath remotePath:remotePath];
}

#pragma mark - GRRequestDelegate required

- (void)requestCompleted:(GRRequest *)request
{
    // listing request
    if ([request isKindOfClass:[GRListingRequest class]]) {
        NSMutableArray *listing = [NSMutableArray array];
        for (NSDictionary *file in ((GRListingRequest *)request).filesInfo) {
            [listing addObject:[file objectForKey:(id)kCFFTPResourceName]];
        }
        if ([self.delegate respondsToSelector:@selector(requestsManager:didCompleteListingRequest:listing:)]) {
            [self.delegate requestsManager:self
                 didCompleteListingRequest:((GRListingRequest *)request)
                                   listing:listing];
        }
    }

    // create directory request
    if ([request isKindOfClass:[GRCreateDirectoryRequest class]]) {
        if ([self.delegate respondsToSelector:@selector(requestsManager:didCompleteCreateDirectoryRequest:)]) {
            [self.delegate requestsManager:self didCompleteCreateDirectoryRequest:(GRUploadRequest *)request];
        }
    }

    // delete request
    if ([request isKindOfClass:[GRDeleteRequest class]]) {
        if ([self.delegate respondsToSelector:@selector(requestsManager:didCompleteDeleteRequest:)]) {
            [self.delegate requestsManager:self didCompleteDeleteRequest:(GRUploadRequest *)request];
        }
    }

    // upload request
    if ([request isKindOfClass:[GRUploadRequest class]]) {
        if ([self.delegate respondsToSelector:@selector(requestsManager:didCompleteUploadRequest:)]) {
            [self.delegate requestsManager:self didCompleteUploadRequest:(GRUploadRequest *)request];
        }
        _currentUploadData = nil;
    }

    // download request
    else if ([request isKindOfClass:[GRDownloadRequest class]]) {
        NSError *writeError = nil;
        BOOL writeToFileSucceeded = [_currentDownloadData writeToFile:((GRDownloadRequest *)request).localFilePath
                                                              options:NSDataWritingAtomic
                                                                error:&writeError];

        if (writeToFileSucceeded && !writeError) {
            if ([self.delegate respondsToSelector:@selector(requestsManager:didCompleteDownloadRequest:)]) {
                [self.delegate requestsManager:self didCompleteDownloadRequest:(GRDownloadRequest *)request];
            }
        }
        else {
            if ([self.delegate respondsToSelector:@selector(requestsManager:didFailWritingFileAtPath:forRequest:error:)]) {
                [self.delegate requestsManager:self
                      didFailWritingFileAtPath:((GRDownloadRequest *)request).localFilePath
                                    forRequest:(GRDownloadRequest *)request
                                         error:writeError];
            }
        }
        _currentDownloadData = nil;
    }

    [self _processNextRequest];
}

- (void)requestFailed:(GRRequest *)request
{
    if ([self.delegate respondsToSelector:@selector(requestsManager:didFailRequest:withError:)]) {
        NSError *error = [NSError errorWithDomain:@"com.albertodebortoli.goldraccoon" code:-1000 userInfo:@{@"message": request.error.message}];
        [self.delegate requestsManager:self didFailRequest:request withError:error];
    }

    [self _processNextRequest];
}

#pragma mark - GRRequestDelegate optional

- (void)percentCompleted:(float)percent forRequest:(id<GRRequestProtocol>)request
{
    if (_delegateRespondsToPercentProgress) {
        [self.delegate requestsManager:self didCompletePercent:percent forRequest:request];
    }
}

- (void)dataAvailable:(NSData *)data forRequest:(id<GRDataExchangeRequestProtocol>)request
{
    [_currentDownloadData appendData:data];
}

- (BOOL)shouldOverwriteFile:(NSString *)filePath forRequest:(id<GRDataExchangeRequestProtocol>)request
{
    // called only with GRUploadRequest requests
    return YES;
}

#pragma mark - GRRequestDataSource

- (NSString *)hostnameForRequest:(id<GRRequestProtocol>)request
{
    return self.hostname;
}

- (NSString *)portForRequest:(id<GRRequestProtocol>)request
{
    return self.port;
}

- (NSString *)usernameForRequest:(id<GRRequestProtocol>)request
{
    return self.username;
}

- (NSString *)passwordForRequest:(id<GRRequestProtocol>)request
{
    return self.password;
}

- (long)dataSizeForUploadRequest:(id<GRDataExchangeRequestProtocol>)request
{
    return [_currentUploadData length];
}

- (NSData *)dataForUploadRequest:(id<GRDataExchangeRequestProtocol>)request
{
    NSData *temp = _currentUploadData;
    _currentUploadData = nil; // next time will return nil;
    return temp;
}

#pragma mark - Private Methods

- (id<GRRequestProtocol>)_addRequestOfType:(Class)clazz withPath:(NSString *)filePath
{
    id<GRRequestProtocol> request = [[clazz alloc] initWithDelegate:self datasource:self];
    request.path = filePath;

    [self _enqueueRequest:request];
    return request;
}

- (id<GRDataExchangeRequestProtocol>)_addDataExchangeRequestOfType:(Class)clazz withLocalPath:(NSString *)localPath remotePath:(NSString *)remotePath
{
    id<GRDataExchangeRequestProtocol> request = [[clazz alloc] initWithDelegate:self datasource:self];
    request.path = remotePath;
    request.localFilePath = localPath;

    [self _enqueueRequest:request];
    return request;
}

- (void)_enqueueRequest:(id<GRRequestProtocol>)request
{
    [self.requestQueue enqueue:request];
}

- (void)_processNextRequest
{
    self.currentRequest = [self.requestQueue dequeue];

    if (self.currentRequest == nil) {
        [self stopAndCancelAllRequests];

        if ([self.delegate respondsToSelector:@selector(requestsManagerDidCompleteQueue:)]) {
            [self.delegate requestsManagerDidCompleteQueue:self];
        }

        return;
    }

    if ([self.currentRequest isKindOfClass:[GRDownloadRequest class]]) {
        _currentDownloadData = [NSMutableData dataWithCapacity:4096];
    }
    if ([self.currentRequest isKindOfClass:[GRUploadRequest class]]) {
        NSString *localFilepath = ((GRUploadRequest *)self.currentRequest).localFilePath;
        _currentUploadData = [NSData dataWithContentsOfFile:localFilepath];
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [self.currentRequest start];
    });

    if ([self.delegate respondsToSelector:@selector(requestsManager:didScheduleRequest:)]) {
        [self.delegate requestsManager:self didScheduleRequest:self.currentRequest];
    }
}

@end
