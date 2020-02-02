//
//  GRQueue.h
//  GoldRaccoon
//
//  Created by Alberto De Bortoli on 14/06/2013.
//  Copyright 2013 Alberto De Bortoli. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface GRQueue : NSObject

- (void)enqueue:(id)object;
- (id)dequeue;
- (BOOL)removeObject:(id)object;
- (NSArray *)allItems;
- (NSUInteger)count;
- (void)clear;

@end
