#!bin/bash

# Run these commands to install the app on Ubuntu 16.04.

# update packages
apt-get update

# install node 8.5.0 and npm
# instructions here: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install -y nodejs

# install build tools
apt-get install build-essential
apt-get install node-gyp

# install global npm packages
npm install -g cloc
npm install -g nodemon
npm install -g pm2

# install pm2 modules
pm2 install code-flower/pm2-cautious-actions
pm2 install code-flower/pm2-autohook
pm2 install code-flower/pm2-health-check

# install this repo
git clone https://github.com/code-flower/cloc-server.git
# upload secrets file using sftp

# open crontab for editing
crontab -e
# and enable startup script by adding this line
@reboot /root/cloc-server/bin/startup.sh > /root/startup.log 2>&1

# shutdown the droplet and create a snapshot
# start the droplet

