#import <Cocoa/Cocoa.h>

@interface DockDownloadProgressBar : NSProgressIndicator

+ (DockDownloadProgressBar*)sharedDockDownloadProgressBar;

- (void)setProgress:(float)progress;

- (void)updateProgressBar;

- (void)hideProgressBar;

- (void)clear;

@end
