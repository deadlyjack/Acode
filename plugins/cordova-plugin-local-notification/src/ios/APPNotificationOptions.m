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

#import "APPNotificationOptions.h"
#import "UNUserNotificationCenter+APPLocalNotification.h"

@import CoreLocation;
@import UserNotifications;

// Maps these crap where Sunday is the 1st day of the week
static NSInteger WEEKDAYS[8] = { 0, 2, 3, 4, 5, 6, 7, 1 };

@interface APPNotificationOptions ()

// The dictionary which contains all notification properties
@property(nonatomic, retain) NSDictionary* dict;

@end

@implementation APPNotificationOptions : NSObject

@synthesize dict;

#pragma mark -
#pragma mark Initialization

/**
 * Initialize by using the given property values.
 *
 * @param [ NSDictionary* ] dict A key-value property map.
 *
 * @return [ APPNotificationOptions ]
 */
- (id) initWithDict:(NSDictionary*)dictionary
{
    self = [self init];

    self.dict = dictionary;

    [self actions];

    return self;
}

#pragma mark -
#pragma mark Properties

/**
 * The ID for the notification.
 *
 * @return [ NSNumber* ]
 */
- (NSNumber*) id
{
    NSInteger id = [[dict objectForKey:@"id"] integerValue];

    return [NSNumber numberWithInteger:id];
}

/**
 * The ID for the notification.
 *
 * @return [ NSString* ]
 */
- (NSString*) identifier
{
    return [NSString stringWithFormat:@"%@", self.id];
}

/**
 * The title for the notification.
 *
 * @return [ NSString* ]
 */
- (NSString*) title
{
    return [dict objectForKey:@"title"];
}

/**
 * The subtitle for the notification.
 *
 * @return [ NSString* ]
 */
- (NSString*) subtitle
{
    NSArray *parts = [self.title componentsSeparatedByString:@"\n"];

    return parts.count < 2 ? @"" : [parts objectAtIndex:1];
}

/**
 * The text for the notification.
 *
 * @return [ NSString* ]
 */
- (NSString*) text
{
    return [dict objectForKey:@"text"];
}

/**
 * Show notification.
 *
 * @return [ BOOL ]
 */
- (BOOL) silent
{
    return [[dict objectForKey:@"silent"] boolValue];
}

/**
 * Show notification in foreground.
 *
 * @return [ BOOL ]
 */
- (int) priority
{
    return [[dict objectForKey:@"priority"] intValue];
}

/**
 * The badge number for the notification.
 *
 * @return [ NSNumber* ]
 */
- (NSNumber*) badge
{
    id value = [dict objectForKey:@"badge"];

    return (value == NULL) ? NULL : [NSNumber numberWithInt:[value intValue]];
}

/**
 * The category of the notification.
 *
 * @return [ NSString* ]
 */
- (NSString*) categoryId
{
    NSString* value = [dict objectForKey:@"actionGroupId"];

    return value.length ? value : kAPPGeneralCategory;
}

/**
 * The sound file for the notification.
 *
 * @return [ UNNotificationSound* ]
 */
- (UNNotificationSound*) sound
{
    NSString* path = [dict objectForKey:@"sound"];
    NSString* file;

    if ([path isKindOfClass:NSNumber.class]) {
        return [path boolValue] ? [UNNotificationSound defaultSound] : NULL;
    }

    if (!path.length)
        return NULL;

    if ([path hasPrefix:@"file:/"]) {
        file = [self soundNameForAsset:path];
    } else
    if ([path hasPrefix:@"res:"]) {
        file = [self soundNameForResource:path];
    }

    return [UNNotificationSound soundNamed:file];
}


/**
 * Additional content to attach.
 *
 * @return [ UNNotificationSound* ]
 */
- (NSArray<UNNotificationAttachment *> *) attachments
{
    NSArray* paths              = [dict objectForKey:@"attachments"];
    NSMutableArray* attachments = [[NSMutableArray alloc] init];

    if (!paths)
        return attachments;

    for (NSString* path in paths) {
        NSURL* url = [self urlForAttachmentPath:path];

        UNNotificationAttachment* attachment;
        attachment = [UNNotificationAttachment attachmentWithIdentifier:path
                                                                    URL:url
                                                                options:NULL
                                                                  error:NULL];

        if (attachment) {
            [attachments addObject:attachment];
        }
    }

    return attachments;
}

/**
 * Additional actions for the notification.
 *
 * @return [ NSArray* ]
 */
- (NSArray<UNNotificationAction *> *) actions
{
    NSArray* items          = [dict objectForKey:@"actions"];
    NSMutableArray* actions = [[NSMutableArray alloc] init];

    if (!items)
        return actions;

    for (NSDictionary* item in items) {
        NSString* id    = [item objectForKey:@"id"];
        NSString* title = [item objectForKey:@"title"];
        NSString* type  = [item objectForKey:@"type"];

        UNNotificationActionOptions options = UNNotificationActionOptionNone;
        UNNotificationAction* action;

        if ([[item objectForKey:@"launch"] boolValue]) {
            options = UNNotificationActionOptionForeground;
        }

        if ([[item objectForKey:@"ui"] isEqualToString:@"decline"]) {
            options = options | UNNotificationActionOptionDestructive;
        }

        if ([[item objectForKey:@"needsAuth"] boolValue]) {
            options = options | UNNotificationActionOptionAuthenticationRequired;
        }

        if ([type isEqualToString:@"input"]) {
            NSString* submitTitle = [item objectForKey:@"submitTitle"];
            NSString* placeholder = [item objectForKey:@"emptyText"];

            if (!submitTitle.length) {
                submitTitle = @"Submit";
            }

            action = [UNTextInputNotificationAction actionWithIdentifier:id
                                                                   title:title
                                                                 options:options
                                                    textInputButtonTitle:submitTitle
                                                    textInputPlaceholder:placeholder];
        } else
        if (!type.length || [type isEqualToString:@"button"]) {
            action = [UNNotificationAction actionWithIdentifier:id
                                                          title:title
                                                        options:options];
        } else {
            NSLog(@"Unknown action type: %@", type);
        }

        if (action) {
            [actions addObject:action];
        }
    }

    return actions;
}

#pragma mark -
#pragma mark Public

/**
 * Specify how and when to trigger the notification.
 *
 * @return [ UNNotificationTrigger* ]
 */
- (UNNotificationTrigger*) trigger
{
    NSString* type = [self valueForTriggerOption:@"type"];

    if ([type isEqualToString:@"location"])
        return [self triggerWithRegion];

    if (![type isEqualToString:@"calendar"])
        NSLog(@"Unknown type: %@", type);

    if ([self isRepeating])
        return [self repeatingTrigger];

    return [self nonRepeatingTrigger];
}

/**
 * The notification's user info dict.
 *
 * @return [ NSDictionary* ]
 */
- (NSDictionary*) userInfo
{
    if ([dict objectForKey:@"updatedAt"]) {
        NSMutableDictionary* data = [dict mutableCopy];

        [data removeObjectForKey:@"updatedAt"];

        return data;
    }

    return dict;
}

#pragma mark -
#pragma mark Private

- (id) valueForTriggerOption:(NSString*)key
{
    return [[dict objectForKey:@"trigger"] objectForKey:key];
}

/**
 * The date when to fire the notification.
 *
 * @return [ NSDate* ]
 */
- (NSDate*) triggerDate
{
    double timestamp = [[self valueForTriggerOption:@"at"] doubleValue];

    return [NSDate dateWithTimeIntervalSince1970:(timestamp / 1000)];
}

/**
 * If the notification shall be repeating.
 *
 * @return [ BOOL ]
 */
- (BOOL) isRepeating
{
    id every = [self valueForTriggerOption:@"every"];

    if ([every isKindOfClass:NSString.class])
        return ((NSString*) every).length > 0;

    if ([every isKindOfClass:NSDictionary.class])
        return ((NSDictionary*) every).count > 0;

    return every > 0;
}

/**
 * Non repeating trigger.
 *
 * @return [ UNTimeIntervalNotificationTrigger* ]
 */
- (UNNotificationTrigger*) nonRepeatingTrigger
{
    id timestamp = [self valueForTriggerOption:@"at"];

    if (timestamp) {
        return [self triggerWithDateMatchingComponents:NO];
    }

    return [UNTimeIntervalNotificationTrigger
            triggerWithTimeInterval:[self timeInterval] repeats:NO];
}

/**
 * Repeating trigger.
 *
 * @return [ UNNotificationTrigger* ]
 */
- (UNNotificationTrigger*) repeatingTrigger
{
    id every = [self valueForTriggerOption:@"every"];

    if ([every isKindOfClass:NSString.class])
        return [self triggerWithDateMatchingComponents:YES];

    if ([every isKindOfClass:NSDictionary.class])
        return [self triggerWithCustomDateMatchingComponents];

    return [self triggerWithTimeInterval];
}

/**
 * A trigger based on a calendar time defined by the user.
 *
 * @return [ UNTimeIntervalNotificationTrigger* ]
 */
- (UNTimeIntervalNotificationTrigger*) triggerWithTimeInterval
{
    double ticks   = [[self valueForTriggerOption:@"every"] doubleValue];
    NSString* unit = [self valueForTriggerOption:@"unit"];
    double seconds = [self convertTicksToSeconds:ticks unit:unit];

    if (seconds < 60) {
        NSLog(@"time interval must be at least 60 sec if repeating");
        seconds = 60;
    }

    return [UNTimeIntervalNotificationTrigger
            triggerWithTimeInterval:seconds repeats:YES];
}

/**
 * A repeating trigger based on a calendar time intervals defined by the plugin.
 *
 * @return [ UNCalendarNotificationTrigger* ]
 */
- (UNCalendarNotificationTrigger*) triggerWithDateMatchingComponents:(BOOL)repeats
{
    NSCalendar* cal        = [self calendarWithMondayAsFirstDay];
    NSDateComponents *date = [cal components:[self repeatInterval]
                                    fromDate:[self triggerDate]];

    date.timeZone = [NSTimeZone defaultTimeZone];

    return [UNCalendarNotificationTrigger
            triggerWithDateMatchingComponents:date repeats:repeats];
}

/**
 * A repeating trigger based on a calendar time intervals defined by the user.
 *
 * @return [ UNCalendarNotificationTrigger* ]
 */
- (UNCalendarNotificationTrigger*) triggerWithCustomDateMatchingComponents
{
    NSCalendar* cal        = [self calendarWithMondayAsFirstDay];
    NSDateComponents *date = [self customDateComponents];

    date.calendar = cal;
    date.timeZone = [NSTimeZone defaultTimeZone];

    return [UNCalendarNotificationTrigger
            triggerWithDateMatchingComponents:date repeats:YES];
}

/**
 * A repeating trigger based on a location region.
 *
 * @return [ UNLocationNotificationTrigger* ]
 */
- (UNLocationNotificationTrigger*) triggerWithRegion
{
    NSArray* center = [self valueForTriggerOption:@"center"];
    double radius   = [[self valueForTriggerOption:@"radius"] doubleValue];
    BOOL single     = [[self valueForTriggerOption:@"single"] boolValue];

    CLLocationCoordinate2D coord =
    CLLocationCoordinate2DMake([center[0] doubleValue], [center[1] doubleValue]);

    CLCircularRegion* region =
    [[CLCircularRegion alloc] initWithCenter:coord
                                      radius:radius
                                  identifier:self.identifier];

    region.notifyOnEntry = [[self valueForTriggerOption:@"notifyOnEntry"] boolValue];
    region.notifyOnExit  = [[self valueForTriggerOption:@"notifyOnExit"] boolValue];

    return [UNLocationNotificationTrigger triggerWithRegion:region
                                                    repeats:!single];
}

/**
 * The time interval between the next fire date and now.
 *
 * @return [ double ]
 */
- (double) timeInterval
{
    double ticks   = [[self valueForTriggerOption:@"in"] doubleValue];
    NSString* unit = [self valueForTriggerOption:@"unit"];
    double seconds = [self convertTicksToSeconds:ticks unit:unit];

    return MAX(0.01f, seconds);
}

/**
 * The repeat interval for the notification.
 *
 * @return [ NSCalendarUnit ]
 */
- (NSCalendarUnit) repeatInterval
{
    NSString* interval = [self valueForTriggerOption:@"every"];
    NSCalendarUnit units = NSCalendarUnitYear|NSCalendarUnitMonth|NSCalendarUnitDay|NSCalendarUnitHour|NSCalendarUnitMinute|NSCalendarUnitSecond;

    if ([interval isEqualToString:@"minute"])
        return NSCalendarUnitSecond;

    if ([interval isEqualToString:@"hour"])
        return NSCalendarUnitMinute|NSCalendarUnitSecond;

    if ([interval isEqualToString:@"day"])
        return NSCalendarUnitHour|NSCalendarUnitMinute|NSCalendarUnitSecond;

    if ([interval isEqualToString:@"week"])
        return NSCalendarUnitWeekday|NSCalendarUnitHour|NSCalendarUnitMinute|NSCalendarUnitSecond;

    if ([interval isEqualToString:@"month"])
        return NSCalendarUnitDay|NSCalendarUnitHour|NSCalendarUnitMinute|NSCalendarUnitSecond;

    if ([interval isEqualToString:@"year"])
        return NSCalendarUnitMonth|NSCalendarUnitDay|NSCalendarUnitHour|NSCalendarUnitMinute|NSCalendarUnitSecond;

    return units;
}

/**
 * The repeat interval for the notification.
 *
 * @return [ NSDateComponents* ]
 */
- (NSDateComponents*) customDateComponents
{
    NSDateComponents* date  = [[NSDateComponents alloc] init];
    NSDictionary* every     = [self valueForTriggerOption:@"every"];

    date.second = 0;

    for (NSString* key in every) {
        long value = [[every valueForKey:key] longValue];

        if ([key isEqualToString:@"minute"]) {
            date.minute = value;
        } else
        if ([key isEqualToString:@"hour"]) {
            date.hour = value;
        } else
        if ([key isEqualToString:@"day"]) {
            date.day = value;
        } else
        if ([key isEqualToString:@"weekday"]) {
            date.weekday = WEEKDAYS[value];
        } else
        if ([key isEqualToString:@"weekdayOrdinal"]) {
            date.weekdayOrdinal = value;
        } else
        if ([key isEqualToString:@"week"]) {
            date.weekOfYear = value;
        } else
        if ([key isEqualToString:@"weekOfMonth"]) {
            date.weekOfMonth = value;
        } else
        if ([key isEqualToString:@"month"]) {
            date.month = value;
        } else
        if ([key isEqualToString:@"quarter"]) {
            date.quarter = value;
        } else
        if ([key isEqualToString:@"year"]) {
            date.year = value;
        }
    }

    return date;
}

/**
 * Convert an assets path to an valid sound name attribute.
 *
 * @param [ NSString* ] path A relative assets file path.
 *
 * @return [ NSString* ]
 */
- (NSString*) soundNameForAsset:(NSString*)path
{
    return [path stringByReplacingOccurrencesOfString:@"file:/"
                                           withString:@"www"];
}

/**
 * Convert a ressource path to an valid sound name attribute.
 *
 * @param [ NSString* ] path A relative ressource file path.
 *
 * @return [ NSString* ]
 */
- (NSString*) soundNameForResource:(NSString*)path
{
    return [path pathComponents].lastObject;
}

/**
 * URL for the specified attachment path.
 *
 * @param [ NSString* ] path Absolute/relative path or a base64 data.
 *
 * @return [ NSURL* ]
 */
- (NSURL*) urlForAttachmentPath:(NSString*)path
{
    if ([path hasPrefix:@"file:///"])
    {
        return [self urlForFile:path];
    }
    else if ([path hasPrefix:@"res:"])
    {
        return [self urlForResource:path];
    }
    else if ([path hasPrefix:@"file://"])
    {
        return [self urlForAsset:path];
    }
    else if ([path hasPrefix:@"base64:"])
    {
        return [self urlFromBase64:path];
    }

    NSFileManager* fm = [NSFileManager defaultManager];

    if (![fm fileExistsAtPath:path]){
        NSLog(@"File not found: %@", path);
    }

    return [NSURL fileURLWithPath:path];
}

/**
 * URL to an absolute file path.
 *
 * @param [ NSString* ] path An absolute file path.
 *
 * @return [ NSURL* ]
 */
- (NSURL*) urlForFile:(NSString*)path
{
    NSFileManager* fm = [NSFileManager defaultManager];

    NSString* absPath;
    absPath = [path stringByReplacingOccurrencesOfString:@"file://"
                                              withString:@""];

    if (![fm fileExistsAtPath:absPath]) {
        NSLog(@"File not found: %@", absPath);
    }

    return [NSURL fileURLWithPath:absPath];
}

/**
 * URL to a resource file.
 *
 * @param [ NSString* ] path A relative file path.
 *
 * @return [ NSURL* ]
 */
- (NSURL*) urlForResource:(NSString*)path
{
    NSFileManager* fm    = [NSFileManager defaultManager];
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSString* bundlePath = [mainBundle resourcePath];

    if ([path isEqualToString:@"res://icon"]) {
        path = @"res://AppIcon60x60@3x.png";
    }

    NSString* absPath;
    absPath = [path stringByReplacingOccurrencesOfString:@"res:/"
                                              withString:@""];

    absPath = [bundlePath stringByAppendingString:absPath];

    if (![fm fileExistsAtPath:absPath]) {
        NSLog(@"File not found: %@", absPath);
    }

    return [NSURL fileURLWithPath:absPath];
}

/**
 * URL to an asset file.
 *
 * @param path A relative www file path.
 *
 * @return [ NSURL* ]
 */
- (NSURL*) urlForAsset:(NSString*)path
{
    NSFileManager* fm    = [NSFileManager defaultManager];
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSString* bundlePath = [mainBundle bundlePath];

    NSString* absPath;
    absPath = [path stringByReplacingOccurrencesOfString:@"file:/"
                                              withString:@"/www"];

    absPath = [bundlePath stringByAppendingString:absPath];

    if (![fm fileExistsAtPath:absPath]) {
        NSLog(@"File not found: %@", absPath);
    }

    return [NSURL fileURLWithPath:absPath];
}

/**
 * URL for a base64 encoded string.
 *
 * @param [ NSString* ] base64String Base64 encoded string.
 *
 * @return [ NSURL* ]
 */
- (NSURL*) urlFromBase64:(NSString*)base64String
{
    NSString *filename = [self basenameFromAttachmentPath:base64String];
    NSUInteger length = [base64String length];
    NSRegularExpression *regex;
    NSString *dataString;

    regex = [NSRegularExpression regularExpressionWithPattern:@"^base64:[^/]+.."
                                                      options:NSRegularExpressionCaseInsensitive
                                                        error:Nil];

    dataString = [regex stringByReplacingMatchesInString:base64String
                                                 options:0
                                                   range:NSMakeRange(0, length)
                                            withTemplate:@""];

    NSData* data = [[NSData alloc] initWithBase64EncodedString:dataString
                                                       options:0];


    return [self urlForData:data withFileName:filename];
}

/**
 * Extract the attachments basename.
 *
 * @param [ NSString* ] path The file path or base64 data.
 *
 * @return [ NSString* ]
 */
- (NSString*) basenameFromAttachmentPath:(NSString*)path
{
    if ([path hasPrefix:@"base64:"]) {
        NSString* pathWithoutPrefix;
        pathWithoutPrefix = [path stringByReplacingOccurrencesOfString:@"base64:"
                                                            withString:@""];

        return [pathWithoutPrefix substringToIndex:
                [pathWithoutPrefix rangeOfString:@"//"].location];
    }

    return path;
}

/**
 * Write the data into a temp file.
 *
 * @param [ NSData* ]   data The data to save to file.
 * @param [ NSString* ] name The name of the file.
 *
 * @return [ NSURL* ]
 */
- (NSURL*) urlForData:(NSData*)data withFileName:(NSString*) filename
{
    NSFileManager* fm = [NSFileManager defaultManager];
    NSString* tempDir = NSTemporaryDirectory();

    [fm createDirectoryAtPath:tempDir withIntermediateDirectories:YES
                   attributes:NULL
                        error:NULL];

    NSString* absPath = [tempDir stringByAppendingPathComponent:filename];

    NSURL* url = [NSURL fileURLWithPath:absPath];
    [data writeToURL:url atomically:NO];

    if (![fm fileExistsAtPath:absPath]) {
        NSLog(@"File not found: %@", absPath);
    }

    return url;
}

/**
 * Convert the amount of ticks into seconds.
 *
 * @param [ double ]    ticks The amount of ticks.
 * @param [ NSString* ] unit  The unit of the ticks (minute, hour, day, ...)
 *
 * @return [ double ] Amount of ticks in seconds.
 */
- (double) convertTicksToSeconds:(double)ticks unit:(NSString*)unit
{
    if ([unit isEqualToString:@"second"]) {
        return ticks;
    } else
    if ([unit isEqualToString:@"minute"]) {
        return ticks * 60;
    } else
    if ([unit isEqualToString:@"hour"]) {
        return ticks * 60 * 60;
    } else
    if ([unit isEqualToString:@"day"]) {
        return ticks * 60 * 60 * 24;
    } else
    if ([unit isEqualToString:@"week"]) {
        return ticks * 60 * 60 * 24 * 7;
    } else
    if ([unit isEqualToString:@"month"]) {
        return ticks * 60 * 60 * 24 * 30.438;
    } else
    if ([unit isEqualToString:@"quarter"]) {
        return ticks * 60 * 60 * 24 * 91.313;
    } else
    if ([unit isEqualToString:@"year"]) {
        return ticks * 60 * 60 * 24 * 365;
    }

    return 0;
}

/**
 * Instance if a calendar where the monday is the first day of the week.
 *
 * @return [ NSCalendar* ]
 */
- (NSCalendar*) calendarWithMondayAsFirstDay
{
    NSCalendar* cal = [[NSCalendar alloc]
                       initWithCalendarIdentifier:NSCalendarIdentifierISO8601];

    cal.firstWeekday = 2;
    cal.minimumDaysInFirstWeek = 1;

    return cal;
}

@end
