/*
 *  Diagnostic_Contacts.m
 *  Diagnostic Plugin - Contacts Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import "Diagnostic_Contacts.h"

@implementation Diagnostic_Contacts

// Internal reference to Diagnostic singleton instance
static Diagnostic* diagnostic;

#if __IPHONE_OS_VERSION_MAX_ALLOWED < __IPHONE_9_0
ABAddressBookRef _addressBook;
#endif

// Internal constants
static NSString*const LOG_TAG = @"Diagnostic_Contacts[native]";

- (void)pluginInitialize {
    
    [super pluginInitialize];

    diagnostic = [Diagnostic getInstance];

#if defined(__IPHONE_9_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_9_0
    self.contactStore = [[CNContactStore alloc] init];
#endif
}

/********************************/
#pragma mark - Plugin API
/********************************/


- (void) getAddressBookAuthorizationStatus: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
            NSString* status;

#if defined(__IPHONE_9_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_9_0
            CNAuthorizationStatus authStatus = [CNContactStore authorizationStatusForEntityType:CNEntityTypeContacts];
            if(authStatus == CNAuthorizationStatusDenied || authStatus == CNAuthorizationStatusRestricted){
                status = AUTHORIZATION_DENIED;
            }else if(authStatus == CNAuthorizationStatusNotDetermined){
                status = AUTHORIZATION_NOT_DETERMINED;
            }else if(authStatus == CNAuthorizationStatusAuthorized){
                status = AUTHORIZATION_GRANTED;
            }
#else
            ABAuthorizationStatus authStatus = ABAddressBookGetAuthorizationStatus();
            if(authStatus == kABAuthorizationStatusDenied || authStatus == kABAuthorizationStatusRestricted){
                status = AUTHORIZATION_DENIED;
            }else if(authStatus == kABAuthorizationStatusNotDetermined){
                status = AUTHORIZATION_NOT_DETERMINED;
            }else if(authStatus == kABAuthorizationStatusAuthorized){
                status = AUTHORIZATION_GRANTED;
            }
#endif

            [diagnostic logDebug:[NSString stringWithFormat:@"Address book authorization status is: %@", status]];
            [diagnostic sendPluginResultString:status:command];

        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) isAddressBookAuthorized: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {

#if defined(__IPHONE_9_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_9_0
            CNAuthorizationStatus authStatus = [CNContactStore authorizationStatusForEntityType:CNEntityTypeContacts];
            [diagnostic sendPluginResultBool:authStatus == CNAuthorizationStatusAuthorized :command];
#else
            ABAuthorizationStatus authStatus = ABAddressBookGetAuthorizationStatus();
            [diagnostic sendPluginResultBool:authStatus == kABAuthorizationStatusAuthorized :command];
#endif
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}

- (void) requestAddressBookAuthorization: (CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        @try {
#if __IPHONE_OS_VERSION_MAX_ALLOWED < __IPHONE_9_0
            ABAddressBookRequestAccessWithCompletion(self.addressBook, ^(bool granted, CFErrorRef error) {
                [diagnostic logDebug:@"Access request to address book: %d", granted];
                [diagnostic sendPluginResultBool:granted :command];
            });

#else
            [self.contactStore requestAccessForEntityType:CNEntityTypeContacts completionHandler:^(BOOL granted, NSError * _Nullable error) {
                if(error == nil) {
                    [diagnostic logDebug:[NSString stringWithFormat:@"Access request to address book: %d", granted]];
                    [diagnostic sendPluginResultBool:granted :command];
                }
                else {
                    [diagnostic sendPluginResultBool:FALSE :command];
                }
            }];
#endif
        }
        @catch (NSException *exception) {
            [diagnostic handlePluginException:exception :command];
        }
    }];
}


/********************************/
#pragma mark - Internals
/********************************/

#if __IPHONE_OS_VERSION_MAX_ALLOWED < __IPHONE_9_0
- (ABAddressBookRef)addressBook {
    if (!_addressBook) {
        ABAddressBookRef addressBook = ABAddressBookCreateWithOptions(NULL, NULL);

        if (addressBook) {
            [self setAddressBook:CFAutorelease(addressBook)];
        }
    }

    return _addressBook;
}

- (void)setAddressBook:(ABAddressBookRef)newAddressBook {
    if (_addressBook != newAddressBook) {
        if (_addressBook) {
            CFRelease(_addressBook);
        }

        if (newAddressBook) {
            CFRetain(newAddressBook);
        }

        _addressBook = newAddressBook;
    }
}

- (void)dealloc {
    if (_addressBook) {
        CFRelease(_addressBook);
        _addressBook = NULL;
    }
}
#endif

@end
