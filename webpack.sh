#!/bin/bash

if [[ $1 = '-p' ]] || [[ $1 = '--production' ]];
then
    echo 'PRODUCTION'
    eval webpack --colors --watch --progress -p
else
    echo 'NOT PRODUCTION'
    eval webpack --colors --watch --progress
fi