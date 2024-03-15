# Change Log

## [1.10.0]

- New
  - [x] **Ace editor** | 937
    - Updated Ace editor to version 1.32.7
- Fixes
  - [x] **UI** | 944
    - Fixed status and navigation text color not visible in light theme.
  - [x] **Plugin** | 944
    - Fixed updates for plugin not showing up.

- Fixes
  - [x] **Text selection** | 937
    - Fixed context menu not showing up when selecting all text from context menu after click and hold.

## [1.9.0]

- New
  - [x] **New in app browser** | 324
    - New in app browser with new UI.
    - You can emulate multiple devices.
  - [x] **New mode** | 933
    - Zig mode
    - Astro mode
- Fixes
  - [x] **File** | 931
    - Fixed not able share, edit or open with other apps.
    - Fixed file rename not working properly. | 934
  - [x] **Preview** | 934
    - Fixed preview where it opens browser two times.

## [1.8.8]

- New
  - [x] **Natural Scrolling** | 331
    - Acode now uses natural scrolling.
- Fixes
  - [x] **Selecting text** | 331
    - Fixed an issue where selecting text using long press and adding text to selection behaves unexpectedly.
  - [x] **Open folders** | 331
    - Fixed an issue where removing folder from sidebar doesn't remove the selected folder.

## [1.8.7]

- New
  - [x] **Updated Ace editor** | 318
    - Updated Ace editor to version 1.28.0
  - [x] **New problems page** | 318
    - You can now see all the problems in one place.
    - You can also see the problems in opened file.
  - [x] **New settings** | 318
    - New settings to toggle side buttons.
  - [x] **New Plugin API** | 318
    - `SideButton` is a new component that can be used to add side buttons.
  - [x] **New theme color** | 318
    - New `danger-color` and `danger-text-color` theme color.
  - [x] **New key binding** | 318
    - Use `Ctrl+Shift+X` key binding to open problems page.
  - [x] **Plugin** | 320
    - Install plugin directly from browser.
  - [x] **Intent** | 323
    - Plugin has now API to handle intent with uri acode://module/action/value.
- Fixes
  - [x] **Plugin page** | 318
    - Improved plugin page UI.
    - Shows plugin quickly when opened and loads new information in background.
  - [x] **Unsaved changes** | 318
    - Fixed unsaved changes not showing up in file when app restarted.
  - [x] **Quicktools** | 319
    - Fixed quicktools slides back when touch moved slightly.
  - [x] **Settings** | 321
    - Fixed settings not saving properly.
  - [x] **Internal storage** | 322
    - Fixed renaming file.
  - [x] **Side buttons** | 323
    - Fixed side buttons not shown properly.
  - [x] **Open folders** | 330
    - Fixed move file/folder not working properly.
  - [x] **Editor** | 330
    - Improved scrolling.
  - [x] **Quicktools** | 330
    - Improved quicktools.

## [1.8.6] - Build 313

- New
  - [x] **Search in settings**
    - You can now search for any settings in settings page.
- Updates
  - [x] **Language**
    - Updated language pack for Russian, Spanish, Portuguese and Deutsche.
  - [x] **Updated Ace editor**
    - Updated Ace editor to version 1.5.0
- Fixes
  - [x] **Sidebar search**
    - Fixed sidebar search not rendering words with special characters.
  - [x] **Not Loading**
    - Fixed app not loading on older devices.
  - [x] **Scrolling**
    - Fixed scrolling not working properly on some devices.
  - [x] **Eruda console**
    - Fixed eruda console not working properly.
  - [x] **Scrollbar**
    - Fixed scrollbar not working properly.
  - [x] **Custom theme**
    - Fixed custom theme not working properly.

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
