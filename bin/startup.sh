#!/bin/bash

# runs after reboot
# to install, run:
# crontab -e and add this line: @reboot /path/to/script

cd /root/cloc-server

echo "GIT PULL"
git pull

echo "NPM INSTALL"
npm install

echo "NPM RUN PROD"
npm run prod

