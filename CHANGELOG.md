# Change Log

## [1.8.5] - Build 295

- New
  - [x] **Scroll speed**
    - New 'Fast x2' scroll speed.
  - [x] **Touch handling**
    - Prevent accidental touch when tapping tear drop.
  - [x] **Color Preview**
    - You can now see color preview in css, scss, less, stylus and sass codes.
    - No need to select the whole color.
    - Enable/disable this feature from editor settings.
  - [x] **Smaller app size**
    - Reduced app size.
  - [x] **Updated icon pack**
    - Updated icon pack (mono color).
  - [x] **Default file encoding**
    - You can set default file encoding from settings.
  - [x] **File encoding**
    - Remember file encoding for each file.
  - [x] **Sidebar apps**
    - File list and extension list now remembers scroll position.
  - [x] **File tab bar**
    - When repositioning file tab bar, tab container will scroll when current tab is at the edge.
- Fixes
  - [x] **Touch handling**
    - Fixed teardrop and text menu not updated when switching tabs.
  - [x] **File encoding**
    - Fixed file encoding not working properly.
  - [x] **File icon**
    - Fixed inconsistent file icon.
  - [x] **JavaScript console**
    - Fixed JavaScript console not opening.
  - [x] **Ads**
    - Fixed ads taking screen when keyboard is open.
  - [x] **Insert file**
    - Fixed 'insert file' in opened folder not working properly.

## [1.8.4] - Build 283

- New
  - [x] **Updated Ace editor**
    - Updated Ace editor to version 1.22.0
  - [x] **Open files position**
    - **Bottom** `beta`: This is new option for open files position. You can change
      this from settings. This will open files in bottom of the screen.
  - [x] **Search in All Files** `beta`
    - This feature can be used to search and replace in all files in the opened projects.
    - To use this feature, open side bar and click on the search icon.
    - Note: This feature is in beta, so it may not work as expected.
  - [x] **Fast File Listing in Find Files (Ctrl + P)**
    - Loads files at startup and caches them for faster loading.
    - Watches file being created or modified from sidebar and updates the list
      accordingly.
  - [x] **Ctrl Key Functionality**
    - Keyboard shortcuts:
      - Ctrl+S: Save
      - Ctrl+Shift+P: Open the command palette. (Your shortcut may be different
        depending on what is saved in .keybindings.json file.)
  - [x] **Plugin API**
    - `contextMenu` is a component that can be used to show context menu in your plugin page.
  - [x] **Customisable quick tools**
    - You can now customise quick tools from settings.
- Fixes
  - [x] **Scrolling Issue**
    - Resolved an issue causing automatic scrolling from the cursor's
      position when the back button is pressed with the soft keyboard up.
    - Fixed a bug where scrollbar gets visible even when the file is not
      scrollable.
  - [x] **Active files in sidebar**
    - Fixed active files taking whole height of sidebar.
  - [x] **File opened using intent**
    - Fixed file opened using intent is not set as active file.
  - [x] **App doesn't load**
    - Fixed an issue where the app wouldn't load when an error occurred.
  - [x] **File tab bar**
    - Changing file tab bar position will not make editor lose focus.
  - [x] **Sidebar**
    - Fixed sidebar resized unknowingly when dragged to open or close it.
  - [x] **Close all tabs**
    - Fixed "close all" action opens up multiple confirm dialog for every unsaved file.
    - Now it will ask what to do with unsaved files.
  - [x] **File changed alert**
    - Fixed file changed alert showing up even when file is not changed.
  - [x] **X-Plore**
    - Fixed file not opening when opened from X-Plore.
  - [x] **Extensions app in sidebar**
    - Fixed extensions app's explore not rendering properly.
  - [x] **Minor bugs**
    - Fixed many minor bugs.
    - Improved stability.

## [1.8.3] - Build 278

- [x] Bugs fixes

## [1.8.2] - Build 276

- [x] Updated ace editor to version v1.18.0
- [x] Bugs fixes

## [1.8.1] - Build 274

- [x] Clicking on gutter will go to that line
- [x] Plugin Stability improvement
- [x] Updated ace editor
- [x] Bugs fixes

## [1.8.0] - Build 272

- [x] Plugins can support themes, fonts and sidebar items
- [x] Redesigned sidebar and quicktools
- [x] UI improvements
- [x] Bugs fixes

## [1.7.2] - Build 268

- [x] Added new command to toggle quick tools
- [x] Added back search in quick tools
- [x] Palette will close on ESC key
- [x] Plugin settings UI
- [x] Bugs fixes

## [1.7.1] - Build 266

- [x] Swipe to change tab in plugins page
- [x] Fixed update paid plugin
- [x] Bugs fixes

## [1.7.0] - Build 262

- [x] New medium size teardrop
- [x] Fixed some indic languages rendering
- [x] Fixed selection bug
- [x] Support for paid plugins
- [x] Quick tools improvement
- [x] Settings will have info button, you can see more info about settings
- [x] Updated plugin system
- [x] You can see plugin review and rating
- [x] GitHub is removed from app but, you can still use it from plugin
- [x] Bugs fixes

## [1.7.0] - Build 260

- [x] Quick tools improvement
- [x] Settings will have info button, you can see more info about settings
- [x] Updated plugin system
- [x] You can see plugin review and rating
- [x] GitHub is removed from app but, you can still use it from plugin
- [x] Bugs fixes

## [1.6.1] - Build 245

- [x] Updated plugin CDN

## [1.6.0] - Build 244

- [x] Updated plugin APIs
- [x] Updated text menu
- [x] Install plugin form device
- [x] Updated ace editor

## [1.6.0] - Build 239

- [x] Fixed horizontal scroll bug
- [x] Updated ace editor

## [1.6.0] - Build 235

- [x] Retry FTP/SFTP connection when fail
- [x] Supports plugin
- [x] Updated custom theme settings
- [x] Set custom port for preview in app settings
- [x] New option find file
- [x] Stability improvement
- [x] UI improvement
- [x] Fixed keyboard issues
- [x] Fixed tap hold to select text
- [x] Fixed loading files using FTP/SFTP
- [x] Fixed File checking
- [x] Fixed settings
- [x] Various fixes
