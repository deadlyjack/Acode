<!--
IMPORTANT: PLEASE READ

WARNING: Failure to follow the issue template guidelines below will result in the issue being immediately closed.

Only bug reports should be opened here.

Before opening an issue, please do the following:
- check a similar issue is not already open (or closed) against this plugin.
	- Duplicates or near-duplicates will be closed immediately.
- try to reproduce the issue using the example project
	- or if that's not possible, using an isolated test project that you are able to share
	- this will eliminate bugs in your code or conflicts with other code as possible causes of the issue
- Any issue which is suspected of being caused by the Ionic Native wrapper should be reported against Ionic Native (https://github.com/ionic-team/ionic-native/issues)
	- Ionic Native Typescript wrappers are maintained by the Ionic Team:
	- To verify an if an issue is caused by this plugin or its Typescript wrapper, please re-test using the vanilla Javascript plugin interface (without the Ionic Native wrapper).
	- Any issue opened here which is obviously an Ionic Typescript wrapper issue will be closed immediately.
-->

<!-- Fill out the relevant sections below and delete irrelevant sections. -->

# Bug report

**Current behavior:**

<!-- Describe how the bug manifests. -->

<!-- Explain how you're sure there is an issue with this plugin rather than your own code:
 - If this plugin has an example project, have you been able to reproduce the issue within it?
 - Have you created a clean test Cordova project containing only this plugin to eliminate the potential for interference with other plugins/code?
 -->

**Expected behavior:**
<!-- Describe what the behavior should be without the bug. -->

**Steps to reproduce:**
<!-- If you are able to illustrate the bug with an example, please provide steps to reproduce. -->

**Screenshots**
<!-- If applicable, add screenshots to help explain your problem. -->

**Environment information**
<!-- Please supply full details of your development environment including: -->
- Cordova CLI version 
	- `cordova -v`
- Cordova platform version
	- `cordova platform ls`
- Plugins & versions installed in project (including this plugin)
    - `cordova plugin ls`
- Dev machine OS and version, e.g.
    - OSX
        - `sw_vers`
    - Windows 10
        - `winver`
        
_Runtime issue_
- Device details
    - _e.g. iPhone 7, Samsung Galaxy S8, iPhone X Simulator, Pixel XL Emulator_
- OS details
    - _e.g. iOS 11.2, Android 8.1_	
	
_Android build issue:_	
- Node JS version
    - `node -v`
- Gradle version
	- `ls platforms/android/.gradle`
- Target Android SDK version
	- `android:targetSdkVersion` in `AndroidManifest.xml`
- Android SDK details
	- `sdkmanager --list | sed -e '/Available Packages/q'`
	
_iOS build issue:_
- Node JS version
    - `node -v`
- XCode version


**Related code:**
```
insert any relevant code here such as plugin API calls / input parameters
```

**Console output**
<details>
<summary>console output</summary>

```

// Paste any relevant JS/native console output here

```

</details><br/><br/>

**Other information:**

<!-- List any other information that is relevant to your issue. Stack traces, related issues, suggestions on how to fix, Stack Overflow links, forum links, etc. -->





<!--
A POLITE REMINDER

- This is free, open-source software. 
- Although the author makes every effort to maintain it, no guarantees are made as to the quality or reliability, and reported issues will be addressed if and when the author has time. 
- Help/support will not be given by the author, so forums (e.g. Ionic) or Stack Overflow should be used. Any issues requesting help/support will be closed immediately.
- If you have urgent need of a bug fix/feature, the author can be engaged for PAID contract work to do so: please contact dave@workingedge.co.uk
- Rude or abusive comments/issues will not be tolerated, nor will opening multiple issues if those previously closed are deemed unsuitable. Any of the above will result in you being BANNED from ALL of my Github repositories.
-->