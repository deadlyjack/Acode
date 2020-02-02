//
//  GRDeleteRequest.m
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

#import "GRDeleteRequest.h"

@implementation GRDeleteRequest

- (NSString *)path
{
    NSString *lastCharacter = [_path substringFromIndex:[_path length] - 1];
    BOOL isDirectory = ([lastCharacter isEqualToString:@"/"]);
    
    if (!isDirectory) {
        return [super path];
    }
    
    NSString *directoryPath = [super path];
    if (![directoryPath isEqualToString:@""]) {
        directoryPath = [directoryPath stringByAppendingString:@"/"];
    }
    
    return directoryPath;
}

- (void)start
{
    SInt32 errorcode;
    
    if ([self.dataSource hostnameForRequest:self] == nil) {
        [self.streamInfo streamError:self errorCode:kGRFTPClientHostnameIsNil];
        return;
    }
    
    if (CFURLDestroyResource(( __bridge CFURLRef) self.fullURLWithEscape, &errorcode)) {
        // successful
        [self.streamInfo streamComplete:self];
    }
    
    else {
        // unsuccessful        
        [self.streamInfo streamError:self errorCode:kGRFTPClientCantDeleteFileOrDirectory];
    }
}

@end
