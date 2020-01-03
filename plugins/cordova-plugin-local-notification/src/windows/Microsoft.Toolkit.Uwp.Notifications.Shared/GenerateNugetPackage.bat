@echo off

set files=..\Microsoft.Windows.Toolkit.Notifications.Portable\bin\Release\Microsoft.Windows.Toolkit.Notifications.dll
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.Portable\bin\Release\Microsoft.Windows.Toolkit.Notifications.pdb
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.Portable\bin\Release\Microsoft.Windows.Toolkit.Notifications.xml

set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.WinRT\bin\Release\Microsoft.Windows.Toolkit.Notifications.winmd
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.WinRT\bin\Release\Microsoft.Windows.Toolkit.Notifications.pri
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.WinRT\bin\Release\Microsoft.Windows.Toolkit.Notifications.pdb
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.WinRT\bin\Release\Microsoft.Windows.Toolkit.Notifications.xml

set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.NETStandard\bin\Release\Microsoft.Windows.Toolkit.Notifications.dll
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.NETStandard\bin\Release\Microsoft.Windows.Toolkit.Notifications.pdb
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.NETStandard\bin\Release\Microsoft.Windows.Toolkit.Notifications.xml

set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.UWP\bin\Release\Microsoft.Windows.Toolkit.Notifications.dll
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.UWP\bin\Release\Microsoft.Windows.Toolkit.Notifications.pdb
set files=%files% ..\Microsoft.Windows.Toolkit.Notifications.UWP\bin\Release\Microsoft.Windows.Toolkit.Notifications.xml

FOR %%f IN (%files%) DO IF NOT EXIST %%f call :file_not_found %%f


echo Here are the current timestamps on the DLL's...
echo.

FOR %%f IN (%files%) DO ECHO %%~tf %%f

echo.

PAUSE



echo Welcome, let's create a new NuGet package for Notifications!
echo.

set /p version="Enter Version Number (ex. 10240.0.0): "

if not exist "NugetPackages" mkdir "NugetPackages"

"C:\Program Files (x86)\NuGet\nuget.exe" pack Microsoft.Windows.Toolkit.Notifications.nuspec -Version %version% -OutputDirectory "NugetPackages"

"C:\Program Files (x86)\NuGet\nuget.exe" pack Microsoft.Windows.Toolkit.Notifications.JavaScript.nuspec -Version %version% -OutputDirectory "NugetPackages"

PAUSE

explorer NugetPackages




exit
:file_not_found

echo File not found: %1
PAUSE
exit
