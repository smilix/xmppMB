#!/bin/sh

# using the nice run script from etherpad-lite with some modifications
# https://github.com/Pita/etherpad-lite

#Move to the folder where app is installed
cd `dirname $0`

#Was this script started in the bin folder? if yes move out
if [ -d "../bin" ]; then
  cd "../"
fi

#Stop the script if its started as root
if [ "$(id -u)" -eq 0 ]; then
   echo "You can't start this app as root!"
   exit 1
fi

echo "start..."
node server.js $*
