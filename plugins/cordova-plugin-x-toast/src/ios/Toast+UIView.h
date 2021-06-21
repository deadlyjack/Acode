#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>

@interface UIView (Toast)

// each makeToast method creates a view and displays it as toast
- (void)makeToast:(NSString *)message;
- (void)makeToast:(NSString *)message duration:(NSTimeInterval)interval position:(id)position;
- (void)makeToast:(NSString *)message duration:(NSTimeInterval)duration position:(id)position addPixelsY:(int)addPixelsY data:(NSDictionary*)data           styling:(NSDictionary*)styling commandDelegate:(id <CDVCommandDelegate>)commandDelegate callbackId:(NSString *)callbackId;
- (void)makeToast:(NSString *)message duration:(NSTimeInterval)interval position:(id)position image:(UIImage *)image;
- (void)makeToast:(NSString *)message duration:(NSTimeInterval)interval position:(id)position title:(NSString *)title;
- (void)makeToast:(NSString *)message duration:(NSTimeInterval)interval position:(id)position title:(NSString *)title image:(UIImage *)image;

- (void)hideToast;

// displays toast with an activity spinner
- (void)makeToastActivity;
- (void)makeToastActivity:(id)position;
- (void)hideToastActivity;

// the showToast methods display any view as toast
- (void)showToast:(UIView *)toast;
- (void)showToast:(UIView *)toast duration:(NSTimeInterval)interval position:(id)point ;
- (void)showToast:(UIView *)toast duration:(NSTimeInterval)interval position:(id)point addedPixelsY:(int)addPixelsY;

@end
