#!/bin/bash

# this script is called by jenkins whenever
# there is a commit to master

# cd to the directory this script is in
cd "$(dirname "$0")"

# deploy the latest code
git pull
npm install
export NODE_ENV=production
gulp build
forever restartall