/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

/*
 NOTE: plugman/cordova cli should have already installed this,
 but you need the value UIViewControllerBasedStatusBarAppearance
 in your Info.plist as well to set the styles in iOS 7
 */

#import "CDVStatusBar.h"
#import <objc/runtime.h>
#import <Cordova/CDVViewController.h>

static const void *kHideStatusBar = &kHideStatusBar;
static const void *kStatusBarStyle = &kStatusBarStyle;

@interface CDVViewController (StatusBar)

@property (nonatomic, retain) id sb_hideStatusBar;
@property (nonatomic, retain) id sb_statusBarStyle;

@end

@implementation CDVViewController (StatusBar)

@dynamic sb_hideStatusBar;
@dynamic sb_statusBarStyle;

- (id)sb_hideStatusBar {
    return objc_getAssociatedObject(self, kHideStatusBar);
}

- (void)setSb_hideStatusBar:(id)newHideStatusBar {
    objc_setAssociatedObject(self, kHideStatusBar, newHideStatusBar, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)sb_statusBarStyle {
    return objc_getAssociatedObject(self, kStatusBarStyle);
}

- (void)setSb_statusBarStyle:(id)newStatusBarStyle {
    objc_setAssociatedObject(self, kStatusBarStyle, newStatusBarStyle, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL) prefersStatusBarHidden {
    return [self.sb_hideStatusBar boolValue];
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    return (UIStatusBarStyle)[self.sb_statusBarStyle intValue];
}

@end


@interface CDVStatusBar () <UIScrollViewDelegate>
- (void)fireTappedEvent;
- (void)updateIsVisible:(BOOL)visible;
@end

@implementation CDVStatusBar

- (id)settingForKey:(NSString*)key
{
    return [self.commandDelegate.settings objectForKey:[key lowercaseString]];
}

- (void)observeValueForKeyPath:(NSString*)keyPath ofObject:(id)object change:(NSDictionary*)change context:(void*)context
{
    if ([keyPath isEqual:@"statusBarHidden"]) {
        NSNumber* newValue = [change objectForKey:NSKeyValueChangeNewKey];
        [self updateIsVisible:![newValue boolValue]];
    }
}

-(void)cordovaViewWillAppear:(NSNotification*)notification
{
    [self resizeWebView];
}

-(void)statusBarDidChangeFrame:(NSNotification*)notification
{
    //add a small delay ( 0.1 seconds ) or statusbar size will be wrong
    __weak CDVStatusBar* weakSelf = self;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.1 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [weakSelf resizeStatusBarBackgroundView];
        [weakSelf resizeWebView];
    });
}

- (void)pluginInitialize
{
    // init
    NSNumber* uiviewControllerBasedStatusBarAppearance = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIViewControllerBasedStatusBarAppearance"];
    _uiviewControllerBasedStatusBarAppearance = (uiviewControllerBasedStatusBarAppearance == nil || [uiviewControllerBasedStatusBarAppearance boolValue]);

    // observe the statusBarHidden property
    [[UIApplication sharedApplication] addObserver:self forKeyPath:@"statusBarHidden" options:NSKeyValueObservingOptionNew context:NULL];

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(statusBarDidChangeFrame:) name: UIApplicationDidChangeStatusBarFrameNotification object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(cordovaViewWillAppear:) name: @"CDVViewWillAppearNotification" object:nil];

    _statusBarOverlaysWebView = YES; // default

    [self initializeStatusBarBackgroundView];

    self.viewController.view.autoresizesSubviews = YES;

    NSString* setting;

    setting  = @"StatusBarBackgroundColor";
    if ([self settingForKey:setting]) {
        [self _backgroundColorByHexString:[self settingForKey:setting]];
    }

    setting  = @"StatusBarStyle";
    if ([self settingForKey:setting]) {
        [self setStatusBarStyle:[self settingForKey:setting]];
    }

    setting  = @"StatusBarDefaultScrollToTop";
    if ([self settingForKey:setting]) {
        self.webView.scrollView.scrollsToTop = [(NSNumber*)[self settingForKey:setting] boolValue];
    } else {
        self.webView.scrollView.scrollsToTop = NO;
    }
 
    // blank scroll view to intercept status bar taps
    UIScrollView *fakeScrollView = [[UIScrollView alloc] initWithFrame:UIScreen.mainScreen.bounds];
    fakeScrollView.delegate = self;
    fakeScrollView.scrollsToTop = YES;
    [self.viewController.view addSubview:fakeScrollView]; // Add scrollview to the view heirarchy so that it will begin accepting status bar taps
    [self.viewController.view sendSubviewToBack:fakeScrollView]; // Send it to the very back of the view heirarchy
    fakeScrollView.contentSize = CGSizeMake(UIScreen.mainScreen.bounds.size.width, UIScreen.mainScreen.bounds.size.height * 2.0f); // Make the scroll view longer than the screen itself
    fakeScrollView.contentOffset = CGPointMake(0.0f, UIScreen.mainScreen.bounds.size.height); // Scroll down so a tap will take scroll view back to the top

    _statusBarVisible = ![UIApplication sharedApplication].isStatusBarHidden;
}

- (void)onReset {
    _eventsCallbackId = nil;
}

- (void)fireTappedEvent {
    if (_eventsCallbackId == nil) {
        return;
    }
    NSDictionary* payload = @{@"type": @"tap"};
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:payload];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:_eventsCallbackId];
}

- (void)updateIsVisible:(BOOL)visible {
    if (_eventsCallbackId == nil) {
        return;
    }
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:visible];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:_eventsCallbackId];
}

- (void) _ready:(CDVInvokedUrlCommand*)command
{
    _eventsCallbackId = command.callbackId;
    [self updateIsVisible:![UIApplication sharedApplication].statusBarHidden];
    NSString* setting = @"StatusBarOverlaysWebView";
    if ([self settingForKey:setting]) {
        self.statusBarOverlaysWebView = [(NSNumber*)[self settingForKey:setting] boolValue];
        if (self.statusBarOverlaysWebView) {
            [self resizeWebView];
        }
    }
}

- (void) initializeStatusBarBackgroundView
{
    CGRect statusBarFrame = [UIApplication sharedApplication].statusBarFrame;

    if ([[UIApplication sharedApplication]statusBarOrientation] == UIInterfaceOrientationPortraitUpsideDown &&
        statusBarFrame.size.height + statusBarFrame.origin.y == [self.viewController.view.window bounds].size.height) {

        // When started in upside-down orientation on iOS 7, status bar will be bound to lower edge of the
        // screen (statusBarFrame.origin.y will be somewhere around screen height). In this case we need to
        // correct frame's coordinates
        statusBarFrame.origin.y = 0;
    }

    _statusBarBackgroundView = [[UIView alloc] initWithFrame:statusBarFrame];
    _statusBarBackgroundView.backgroundColor = _statusBarBackgroundColor;
    _statusBarBackgroundView.autoresizingMask = (UIViewAutoresizingFlexibleWidth  | UIViewAutoresizingFlexibleBottomMargin);
    _statusBarBackgroundView.autoresizesSubviews = YES;
}

- (void) setStatusBarOverlaysWebView:(BOOL)statusBarOverlaysWebView
{
    // we only care about the latest iOS version or a change in setting
    if (statusBarOverlaysWebView == _statusBarOverlaysWebView) {
        return;
    }

    _statusBarOverlaysWebView = statusBarOverlaysWebView;

    [self resizeWebView];

    if (statusBarOverlaysWebView) {

        [_statusBarBackgroundView removeFromSuperview];

    } else {

        [self initializeStatusBarBackgroundView];
        [self.webView.superview addSubview:_statusBarBackgroundView];

    }

}

- (BOOL) statusBarOverlaysWebView
{
    return _statusBarOverlaysWebView;
}

- (void) overlaysWebView:(CDVInvokedUrlCommand*)command
{
    id value = [command argumentAtIndex:0];
    if (!([value isKindOfClass:[NSNumber class]])) {
        value = [NSNumber numberWithBool:YES];
    }

    self.statusBarOverlaysWebView = [value boolValue];
}

- (void) refreshStatusBarAppearance
{
    SEL sel = NSSelectorFromString(@"setNeedsStatusBarAppearanceUpdate");
    if ([self.viewController respondsToSelector:sel]) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
        [self.viewController performSelector:sel withObject:nil];
#pragma clang diagnostic pop
    }
}

- (void) setStyleForStatusBar:(UIStatusBarStyle)style
{
    if (_uiviewControllerBasedStatusBarAppearance) {
        CDVViewController* vc = (CDVViewController*)self.viewController;
        vc.sb_statusBarStyle = [NSNumber numberWithInt:style];
        [self refreshStatusBarAppearance];

    } else {
        [[UIApplication sharedApplication] setStatusBarStyle:style];
    }
}

- (void) setStatusBarStyle:(NSString*)statusBarStyle
{
    // default, lightContent, blackTranslucent, blackOpaque
    NSString* lcStatusBarStyle = [statusBarStyle lowercaseString];

    if ([lcStatusBarStyle isEqualToString:@"default"]) {
        [self styleDefault:nil];
    } else if ([lcStatusBarStyle isEqualToString:@"lightcontent"]) {
        [self styleLightContent:nil];
    } else if ([lcStatusBarStyle isEqualToString:@"blacktranslucent"]) {
        [self styleBlackTranslucent:nil];
    } else if ([lcStatusBarStyle isEqualToString:@"blackopaque"]) {
        [self styleBlackOpaque:nil];
    }
}

- (void) styleDefault:(CDVInvokedUrlCommand*)command
{
    [self setStyleForStatusBar:UIStatusBarStyleDefault];
}

- (void) styleLightContent:(CDVInvokedUrlCommand*)command
{
    [self setStyleForStatusBar:UIStatusBarStyleLightContent];
}

- (void) styleBlackTranslucent:(CDVInvokedUrlCommand*)command
{
    [self setStyleForStatusBar:UIStatusBarStyleLightContent];
}

- (void) styleBlackOpaque:(CDVInvokedUrlCommand*)command
{
    [self setStyleForStatusBar:UIStatusBarStyleLightContent];
}

- (void) backgroundColorByName:(CDVInvokedUrlCommand*)command
{
    id value = [command argumentAtIndex:0];
    if (!([value isKindOfClass:[NSString class]])) {
        value = @"black";
    }

    SEL selector = NSSelectorFromString([value stringByAppendingString:@"Color"]);
    if ([UIColor respondsToSelector:selector]) {
        _statusBarBackgroundView.backgroundColor = [UIColor performSelector:selector];
    }
}

- (void) _backgroundColorByHexString:(NSString*)hexString
{
    unsigned int rgbValue = 0;
    NSScanner* scanner = [NSScanner scannerWithString:hexString];
    [scanner setScanLocation:1];
    [scanner scanHexInt:&rgbValue];

    _statusBarBackgroundColor = [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16)/255.0 green:((rgbValue & 0xFF00) >> 8)/255.0 blue:(rgbValue & 0xFF)/255.0 alpha:1.0];
    _statusBarBackgroundView.backgroundColor = _statusBarBackgroundColor;
}

- (void) backgroundColorByHexString:(CDVInvokedUrlCommand*)command
{
    NSString* value = [command argumentAtIndex:0];
    if (!([value isKindOfClass:[NSString class]])) {
        value = @"#000000";
    }

    if (![value hasPrefix:@"#"] || [value length] < 7) {
        return;
    }

    [self _backgroundColorByHexString:value];
}

- (void) hideStatusBar
{
    if (_uiviewControllerBasedStatusBarAppearance) {
        CDVViewController* vc = (CDVViewController*)self.viewController;
        vc.sb_hideStatusBar = [NSNumber numberWithBool:YES];
        [self refreshStatusBarAppearance];

    } else {
        UIApplication* app = [UIApplication sharedApplication];
        [app setStatusBarHidden:YES];
    }
}

- (void) hide:(CDVInvokedUrlCommand*)command
{
    _statusBarVisible = NO;
    UIApplication* app = [UIApplication sharedApplication];

    if (!app.isStatusBarHidden)
    {

        [self hideStatusBar];

        [_statusBarBackgroundView removeFromSuperview];

        [self resizeWebView];

        _statusBarBackgroundView.hidden = YES;
    }
}

- (void) showStatusBar
{
    if (_uiviewControllerBasedStatusBarAppearance) {
        CDVViewController* vc = (CDVViewController*)self.viewController;
        vc.sb_hideStatusBar = [NSNumber numberWithBool:NO];
        [self refreshStatusBarAppearance];

    } else {
        UIApplication* app = [UIApplication sharedApplication];
        [app setStatusBarHidden:NO];
    }
}

- (void) show:(CDVInvokedUrlCommand*)command
{
    _statusBarVisible = YES;
    UIApplication* app = [UIApplication sharedApplication];

    if (app.isStatusBarHidden)
    {
        [self showStatusBar];
        [self resizeWebView];

        if (!self.statusBarOverlaysWebView) {

            // there is a possibility that when the statusbar was hidden, it was in a different orientation
            // from the current one. Therefore we need to expand the statusBarBackgroundView as well to the
            // statusBar's current size
            [self resizeStatusBarBackgroundView];
            [self.webView.superview addSubview:_statusBarBackgroundView];

        }

        _statusBarBackgroundView.hidden = NO;
    }
}

-(void)resizeStatusBarBackgroundView {
    CGRect statusBarFrame = [UIApplication sharedApplication].statusBarFrame;
    CGRect sbBgFrame = _statusBarBackgroundView.frame;
    sbBgFrame.size = statusBarFrame.size;
    _statusBarBackgroundView.frame = sbBgFrame;
}

-(void)resizeWebView
{
    BOOL isIOS11 = (IsAtLeastiOSVersion(@"11.0"));

    CGRect bounds = [self.viewController.view.window bounds];
    if (CGRectEqualToRect(bounds, CGRectZero)) {
        bounds = [[UIScreen mainScreen] bounds];
    }

    self.viewController.view.frame = bounds;

    self.webView.frame = bounds;

    CGRect statusBarFrame = [UIApplication sharedApplication].statusBarFrame;
    CGRect frame = self.webView.frame;
    CGFloat height = statusBarFrame.size.height;

    if (!self.statusBarOverlaysWebView) {
        frame.origin.y = height;
    } else {
        frame.origin.y = height >= 20 ? height - 20 : 0;
        if (isIOS11) {
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110000
            if (@available(iOS 11.0, *)) {
                float safeAreaTop = self.webView.safeAreaInsets.top;
                if (height >= safeAreaTop && safeAreaTop >0) {
                    // Sometimes when in-call/recording/hotspot larger status bar is present, the safeAreaTop is 40 but we want frame.origin.y to be 20
                    frame.origin.y = safeAreaTop == 40 ? 20 : height - safeAreaTop;
                } else {
                    frame.origin.y = 0;
                }
            }
#endif
        }
    }
    frame.size.height -= frame.origin.y;
    self.webView.frame = frame;
    
}

- (void) dealloc
{
    [[UIApplication sharedApplication] removeObserver:self forKeyPath:@"statusBarHidden"];
    [[NSNotificationCenter defaultCenter]removeObserver:self name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
}


#pragma mark - UIScrollViewDelegate

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollView
{
    [self fireTappedEvent];
    return NO;
}

@end
