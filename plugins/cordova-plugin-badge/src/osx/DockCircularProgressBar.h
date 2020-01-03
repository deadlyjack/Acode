// Borrow from src/chrome/browser/ui/cocoa/dock_icon.h

// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#import <Cocoa/Cocoa.h>

@interface DockCircularProgressBar : NSObject

+ (DockCircularProgressBar*)sharedDockCircularProgressBar;

- (void)updateProgressBar;

- (void)hideProgressBar;

// Indicates whether the progress indicator should be in an indeterminate state
// or not.
- (void)setIndeterminate:(BOOL)indeterminate;

// Indicates the amount of progress made of the download. Ranges from [0..1].
- (void)setProgress:(float)progress;

// Indicates whether the progress number should be showed in circular process bar.
- (void)setShowPercent:(BOOL)show_percent;

- (void)clear;

@property (readonly, getter=getProgress) double doubleValue;

@end
