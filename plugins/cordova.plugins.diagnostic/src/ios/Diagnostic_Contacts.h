/*
 *  Diagnostic_Contacts.h
 *  Diagnostic Plugin - Contacts Module
 *
 *  Copyright (c) 2018 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 */

#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import "Diagnostic.h"

#import <Contacts/Contacts.h>
#import <AddressBook/AddressBook.h>

@interface Diagnostic_Contacts : CDVPlugin

#if defined(__IPHONE_9_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_9_0
@property (nonatomic, retain) CNContactStore* contactStore;
#endif

- (void) getAddressBookAuthorizationStatus: (CDVInvokedUrlCommand*)command;
- (void) isAddressBookAuthorized: (CDVInvokedUrlCommand*)command;
- (void) requestAddressBookAuthorization: (CDVInvokedUrlCommand*)command;

@end
