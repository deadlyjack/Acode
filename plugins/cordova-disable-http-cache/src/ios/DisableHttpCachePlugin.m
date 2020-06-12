#import "DisableHttpCachePlugin.h"

@implementation DisableHttpCachePlugin

- (void)pluginInitialize {
  NSLog(@"DisableHttpCachePlugin: initialize");
  NSURLCache *URLCache = [[NSURLCache alloc] initWithMemoryCapacity:0 diskCapacity:0 diskPath:nil];
  [NSURLCache setSharedURLCache:URLCache];
}

- (DisableHttpCachePlugin*)initWithWebView:(UIWebView*)theWebView {
  return self;
}

@end
