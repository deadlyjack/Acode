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


@interface CDVInAppBrowserOptions : NSObject {}

@property (nonatomic, assign) BOOL usewkwebview;
@property (nonatomic, assign) BOOL location;
@property (nonatomic, assign) BOOL toolbar;
@property (nonatomic, copy) NSString* closebuttoncaption;
@property (nonatomic, copy) NSString* closebuttoncolor;
@property (nonatomic, assign) BOOL lefttoright;
@property (nonatomic, copy) NSString* toolbarposition;
@property (nonatomic, copy) NSString* toolbarcolor;
@property (nonatomic, assign) BOOL toolbartranslucent;
@property (nonatomic, assign) BOOL hidenavigationbuttons;
@property (nonatomic, copy) NSString* navigationbuttoncolor;
@property (nonatomic, assign) BOOL cleardata;
@property (nonatomic, assign) BOOL clearcache;
@property (nonatomic, assign) BOOL clearsessioncache;
@property (nonatomic, assign) BOOL hidespinner;

@property (nonatomic, copy) NSString* presentationstyle;
@property (nonatomic, copy) NSString* transitionstyle;

@property (nonatomic, assign) BOOL enableviewportscale;
@property (nonatomic, assign) BOOL mediaplaybackrequiresuseraction;
@property (nonatomic, assign) BOOL allowinlinemediaplayback;
@property (nonatomic, assign) BOOL keyboarddisplayrequiresuseraction;
@property (nonatomic, assign) BOOL suppressesincrementalrendering;
@property (nonatomic, assign) BOOL hidden;
@property (nonatomic, assign) BOOL disallowoverscroll;
@property (nonatomic, copy) NSString* beforeload;

+ (CDVInAppBrowserOptions*)parseOptions:(NSString*)options;

@end
