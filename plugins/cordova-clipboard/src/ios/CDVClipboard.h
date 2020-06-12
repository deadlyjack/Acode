#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface CDVClipboard : CDVPlugin {}

- (void)copy:(CDVInvokedUrlCommand*)command;
- (void)paste:(CDVInvokedUrlCommand*)command;
- (void)clear:(CDVInvokedUrlCommand*)command;

@end