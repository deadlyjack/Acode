//
//  GRError.h
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

typedef enum GRErrorCodes {
    //client errors
    kGRFTPClientHostnameIsNil = 901,
    kGRFTPClientCantOpenStream = 902,
    kGRFTPClientCantWriteStream = 903,
    kGRFTPClientCantReadStream = 904,
    kGRFTPClientSentDataIsNil = 905,
    kGRFTPClientFileAlreadyExists = 907,
    kGRFTPClientCantOverwriteDirectory = 908,
    kGRFTPClientStreamTimedOut = 909,
    kGRFTPClientCantDeleteFileOrDirectory = 910,
    kGRFTPClientMissingRequestDataAvailable = 911,
    
    // 400 FTP errors
    kGRFTPServerAbortedTransfer = 426,
    kGRFTPServerResourceBusy = 450,
    kGRFTPServerCantOpenDataConnection = 425,
    
    // 500 FTP errors
    kGRFTPServerUserNotLoggedIn = 530,
    kGRFTPServerFileNotAvailable = 550,
    kGRFTPServerStorageAllocationExceeded = 552,
    kGRFTPServerIllegalFileName = 553,
    kGRFTPServerUnknownError
} GRErrorCodes;

@interface GRError : NSObject

@property (assign) GRErrorCodes errorCode;
@property (readonly) NSString *message;

+ (GRErrorCodes)errorCodeWithError:(NSError *)error;

@end
