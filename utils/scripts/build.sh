#! /bin/bash

platform="$1"
app="$2"
mode="$3"
webpackmode="development"
cordovamode=""

if [ -z "$platform" ]
then
platform="android"
fi

if [ -z "$mode" ]
then
mode="d"
fi

if [ -z "$app" ]
then
app="paid"
fi

if [ "$mode" = "p" ] || [ "$mode" = "prod" ]
then
mode="p"
webpackmode="production"
cordovamode="--release"
fi

RED=''
NC=''
script1="node ./utils/config.js $mode $app"
script2="webpack --progress --mode $webpackmode "
script3="node ./utils/loadStyles.js"
script4="cordova build $platform $cordovamode -- --jvmargs='-Xmx1536M --add-exports=java.base/sun.nio.ch=ALL-UNNAMED --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-exports=jdk.unsupported/sun.misc=ALL-UNNAMED'"
eval "
echo \"${RED}$script1${NC}\";
$script1;
echo \"${RED}$script2${NC}\";
$script2&&
echo \"${RED}$script3${NC}\";
$script3;
echo \"${RED}$script4${NC}\";
$script4
"