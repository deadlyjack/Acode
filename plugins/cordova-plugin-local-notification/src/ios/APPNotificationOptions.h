/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
 *
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 */

@import UserNotifications;

@interface APPNotificationOptions : NSObject

@property (readonly, getter=id)          NSNumber*            id;
@property (readonly, getter=identifier)  NSString*            identifier;
@property (readonly, getter=categoryId)  NSString*            categoryId;
@property (readonly, getter=title)       NSString*            title;
@property (readonly, getter=subtitle)    NSString*            subtitle;
@property (readonly, getter=badge)       NSNumber*            badge;
@property (readonly, getter=text)        NSString*            text;
@property (readonly, getter=silent)      BOOL                 silent;
@property (readonly, getter=priority)    int                  priority;
@property (readonly, getter=sound)       UNNotificationSound* sound;
@property (readonly, getter=userInfo)    NSDictionary*        userInfo;
@property (readonly, getter=actions)     NSArray<UNNotificationAction *> * actions;
@property (readonly, getter=attachments) NSArray<UNNotificationAttachment *> * attachments;

- (id) initWithDict:(NSDictionary*)dict;
- (UNNotificationTrigger*) trigger;

@end
