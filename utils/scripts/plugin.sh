#! /bin/bash

if [ -z "$2" ]
then
eval "cordova plugin rm $1; cordova plugin add $1"
else
eval "cordova plugin rm $1; cordova plugin add $2"
fi