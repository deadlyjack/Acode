// Borrow from src/chrome/browser/ui/cocoa/dock_icon.mm

// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#import "DockCircularProgressBar.h"

namespace {

// The fraction of the size of the dock icon that the badge is.
const float kBadgeFraction = 0.4f;
// The indentation of the badge.
const float kBadgeIndent = 5.0f;

class ScopedNSGraphicsContextSaveGState {
 public:
  ScopedNSGraphicsContextSaveGState() {
    [NSGraphicsContext saveGraphicsState];
  }
  ~ScopedNSGraphicsContextSaveGState() {
    [NSGraphicsContext restoreGraphicsState];
  }
};

}

@interface DockTileView : NSView {
@private
  BOOL hide_progress_bar_;
  BOOL show_percent_;
  BOOL indeterminate_;
  //float progress_;
}

// Indicates whether the progress indicator should be in an indeterminate state
// or not.
@property BOOL indeterminate;

// Indicates the amount of progress made of the download. Ranges from [0..1].
@property float progress;

// Indicates whether the progress number should be showed in circular process bar.
@property BOOL showPercent;

@property BOOL hideProgressBar;
@end

@implementation DockTileView

@synthesize indeterminate = indeterminate_;
@synthesize progress = progress_;
@synthesize showPercent = show_percent_;
@synthesize hideProgressBar = hide_progress_bar_;

- (void)drawRect:(NSRect)dirtyRect {
  // Not -[NSApplication applicationIconImage]; that fails to return a pasted
  // custom icon.
  NSString* appPath = [[NSBundle mainBundle] bundlePath];
  NSImage* appIcon = [[NSWorkspace sharedWorkspace] iconForFile:appPath];
  [appIcon drawInRect:[self bounds]
             fromRect:NSZeroRect
            operation:NSCompositeSourceOver
             fraction:1.0];
  
  if (hide_progress_bar_)
    return;
  NSRect badgeRect = [self bounds];
  badgeRect.size.height = (int)(kBadgeFraction * badgeRect.size.height);
  int newWidth = kBadgeFraction * NSWidth(badgeRect);
  badgeRect.origin.x = NSWidth(badgeRect) - newWidth;
  badgeRect.size.width = newWidth;
  
  CGFloat badgeRadius = NSMidY(badgeRect);
  
  badgeRect.origin.x -= kBadgeIndent;
  badgeRect.origin.y += kBadgeIndent;
  
  NSPoint badgeCenter = NSMakePoint(NSMidX(badgeRect), NSMidY(badgeRect));
  
  // Background
  NSColor* backgroundColor = [NSColor colorWithCalibratedRed:0.85
                                                       green:0.85
                                                        blue:0.85
                                                       alpha:1.0];
  NSColor* backgroundHighlight =
  [backgroundColor blendedColorWithFraction:0.85
                                    ofColor:[NSColor whiteColor]];
  NSGradient* backgroundGradient =
      [[NSGradient alloc] initWithStartingColor:backgroundHighlight
                                    endingColor:backgroundColor];
  NSBezierPath* badgeEdge = [NSBezierPath bezierPathWithOvalInRect:badgeRect];
  {
    ScopedNSGraphicsContextSaveGState scopedGState;
    [badgeEdge addClip];
    [backgroundGradient drawFromCenter:badgeCenter
                                radius:0.0
                              toCenter:badgeCenter
                                radius:badgeRadius
                               options:0];
  }
  
  // Slice
  if (!indeterminate_) {
    NSColor* sliceColor = [NSColor colorWithCalibratedRed:0.45
                                                    green:0.8
                                                     blue:0.25
                                                    alpha:1.0];
    NSColor* sliceHighlight =
    [sliceColor blendedColorWithFraction:0.4
                                 ofColor:[NSColor whiteColor]];
    NSGradient* sliceGradient =
        [[NSGradient alloc] initWithStartingColor:sliceHighlight
                                      endingColor:sliceColor];
    NSBezierPath* progressSlice;
    if (progress_ >= 1.0) {
      progressSlice = [NSBezierPath bezierPathWithOvalInRect:badgeRect];
    } else {
      CGFloat endAngle = 90.0 - 360.0 * progress_;
      if (endAngle < 0.0)
        endAngle += 360.0;
      progressSlice = [NSBezierPath bezierPath];
      [progressSlice moveToPoint:badgeCenter];
      [progressSlice appendBezierPathWithArcWithCenter:badgeCenter
                                                radius:badgeRadius
                                            startAngle:90.0
                                              endAngle:endAngle
                                             clockwise:YES];
      [progressSlice closePath];
    }
    ScopedNSGraphicsContextSaveGState scopedGState;
    [progressSlice addClip];
    [sliceGradient drawFromCenter:badgeCenter
                           radius:0.0
                         toCenter:badgeCenter
                           radius:badgeRadius
                          options:0];
  }
  
  // Edge
  {
    ScopedNSGraphicsContextSaveGState scopedGState;
    [[NSColor whiteColor] set];
    NSShadow* shadow = [[NSShadow alloc] init];
    [shadow setShadowOffset:NSMakeSize(0, -2)];
    [shadow setShadowBlurRadius:2];
    [shadow set];
    [badgeEdge setLineWidth:2];
    [badgeEdge stroke];
  }
  
  if (!show_percent_) return;

  // Show percent. 
  NSNumberFormatter* formatter = [[NSNumberFormatter alloc] init];
  NSString* countString =
  [formatter stringFromNumber:[NSNumber numberWithInt:(int)(progress_ * 100)]];
  
  NSShadow* countShadow = [[NSShadow alloc] init];
  [countShadow setShadowBlurRadius:3.0];
  [countShadow setShadowColor:[NSColor whiteColor]];
  [countShadow setShadowOffset:NSMakeSize(0.0, 0.0)];
  NSMutableDictionary* countAttrsDict =
  [NSMutableDictionary dictionaryWithObjectsAndKeys:
   [NSColor blackColor], NSForegroundColorAttributeName,
   countShadow, NSShadowAttributeName,
   nil];
  CGFloat countFontSize = badgeRadius;
  NSSize countSize = NSZeroSize;
  NSAttributedString* countAttrString;
  while (1) {
    NSFont* countFont = [NSFont fontWithName:@"Helvetica-Bold"
                                        size:countFontSize];
    
    // This will generally be plain Helvetica.
    if (!countFont)
      countFont = [NSFont userFontOfSize:countFontSize];
    
    // Continued failure would generate an NSException.
    if (!countFont)
      break;
    
    [countAttrsDict setObject:countFont forKey:NSFontAttributeName];
    countAttrString = 
        [[NSAttributedString alloc] initWithString:countString
                                        attributes:countAttrsDict];
    countSize = [countAttrString size];
    if (countSize.width > badgeRadius * 1.5) {
      countFontSize -= 1.0;
    } else {
      break;
    }
  }
  
  NSPoint countOrigin = badgeCenter;
  countOrigin.x -= countSize.width / 2;
  countOrigin.y -= countSize.height / 2.2;  // tweak; otherwise too low
  
  [countAttrString drawAtPoint:countOrigin];
}

@end
@implementation DockCircularProgressBar

+ (DockCircularProgressBar*) sharedDockCircularProgressBar {
  static DockCircularProgressBar* progress_bar;
  NSDockTile* dockTile = [NSApp dockTile];
  if (!progress_bar) {
    progress_bar = [[DockCircularProgressBar alloc] init];
  }
  if ([dockTile contentView] == NULL) {
    DockTileView* dockTileView = [[DockTileView alloc] init];
    [dockTile setContentView:dockTileView];
  }
  return progress_bar;
}

- (void)updateProgressBar {
  NSDockTile* dockTile = [[NSApplication sharedApplication] dockTile];
  DockTileView* dockTileView = (DockTileView*)([dockTile contentView]);
  [dockTileView setHideProgressBar:NO];
  [[NSApp dockTile] display];
}

-(void)hideProgressBar {
  NSDockTile* dockTile = [[NSApplication sharedApplication] dockTile];
  DockTileView* dockTileView = (DockTileView*)([dockTile contentView]);
  [dockTileView setHideProgressBar:YES];
  [[NSApp dockTile] display];
}

- (void)setIndeterminate:(BOOL)indeterminate {
  NSDockTile* dockTile = [[NSApplication sharedApplication] dockTile];
  DockTileView* dockTileView = (DockTileView*)([dockTile contentView]);
  
  if (indeterminate != [dockTileView indeterminate]) {
    [dockTileView setIndeterminate:indeterminate];
  }
}

- (void)setProgress:(float) progress {
  NSDockTile* dockTile = [[NSApplication sharedApplication] dockTile];
  DockTileView* dockTileView = (DockTileView*)([dockTile contentView]);
  
  [dockTileView setProgress:progress];
}

- (void)setShowPercent:(BOOL)show_percent {
  NSDockTile* dockTile = [[NSApplication sharedApplication] dockTile];
  DockTileView* dockTileView = (DockTileView*)([dockTile contentView]);
  
  [dockTileView setShowPercent:show_percent];
}

- (void)clear {
  [[NSApp dockTile] setContentView:NULL];
}

- (double) getProgress
{
    NSDockTile* dockTile = [[NSApplication sharedApplication] dockTile];
    DockTileView* dockTileView = (DockTileView*)([dockTile contentView]);
    
    return (double)dockTileView.progress;
}
@end
