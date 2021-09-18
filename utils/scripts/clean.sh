#! /bin/bash

platform_rm=$1
platform_add=$2

if [ -z "$platform_rm" ]
then
platform_rm="android"
fi

if [ -z "$platform_add" ]
then
platform_add="$platform_rm"
fi

eval "
cordova platform rm $platform_rm;
cordova platform add $platform_add
"