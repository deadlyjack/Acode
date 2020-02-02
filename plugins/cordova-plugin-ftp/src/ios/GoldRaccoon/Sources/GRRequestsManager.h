//
//  GRRequestsManager.h
//  GoldRaccoon
//  v1.0.1
//
//  Created by Alberto De Bortoli on 14/06/2013.
//  Copyright 2013 Alberto De Bortoli. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "GRRequestsManagerProtocol.h"

/**
 Instances of this class manage a queue of requests against an FTP server.
 The different request types are:

  * list directory
  * create directory
  * delete directory
  * delete file
  * upload file
  * download file

 As soon as the requests are submitted to the GRRequestsManager, they are queued in a FIFO queue.
 The FTP Manager must be started with the startProcessingRequests method and can be shut down with the stopAndCancelAllRequests method.
 When processed, the requests are executed one at a time (max concurrency = 1).
 When no more requests are in the queue the GRRequestsManager automatically shut down.
*/
@interface GRRequestsManager : NSObject <GRRequestsManagerProtocol>

/**
 Reference to the delegate object
 */
@property (nonatomic, weak) id<GRRequestsManagerDelegate> delegate;

/**
 @brief Initialize a GRRequestsManager object with given hostname, username and password.
 @param hostname The hostname of the FTP service to connect to.
 @param username The username to use for connecting to the FTP service.
 @param password The password to use for connecting to the FTP service.
 @return A GRRequestsManager object.
 */
- (instancetype)initWithHostname:(NSString *)hostname user:(NSString *)username password:(NSString *)password;

/**
 @brief Initialize a GRRequestsManager object with given hostname, port, username and password.
 @param hostname The hostname of the FTP service to connect to.
 @param port The port of the FTP service to connect to.
 @param username The username to use for connecting to the FTP service.
 @param password The password to use for connecting to the FTP service.
 @return A GRRequestsManager object.
 */
- (instancetype)initWithHostname:(NSString *)hostname port:(NSNumber *)port user:(NSString *)username password:(NSString *)password;

@end
