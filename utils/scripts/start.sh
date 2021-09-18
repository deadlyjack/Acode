#! /bin/bash

platform="$1"
mode="$2"
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

if [ "$mode" = "p" ]
then
webpackmode="production"
cordovamode="--release"
fi

RED='\033[1;34m'
NC='\033[0m'
script1="node ./utils/config.js $mode"
script2="webpack --progress --mode $webpackmode "
script3="cordova run $platform $cordovamode"
eval "
echo \"${RED}$script1${NC}\";
$script1;
echo \"${RED}$script2${NC}\";
$script2&&
echo \"${RED}$script3${NC}\";
$script3
"