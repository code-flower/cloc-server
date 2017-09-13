#!bin/bash

# add these environment vars to the end of the .bashrc file
export codeflower_cert_dir="/etc/letsencrypt/live/api.codeflower.la/"
export external_ip_address=$(hostname -I | cut -d ' ' -f 1)
source .bashrc

# install git
sudo apt-get update
sudo apt-get install git

# install node 8.4.0 and npm
# instructions here: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# install build tools
sudo apt-get install build-essential
apt install node-gyp

# clone and enter this repo
git clone https://github.com/code-flower/cloc-server.git
cd cloc-server

# install local npm packages
npm install

# install global npm packages
npm install -g cloc
npm install -g nodemon
npm install -g pm2

# install pm2 modules
pm2 install code-flower/pm2-cautious-reload
pm2 install code-flower/pm2-autohook
pm2 install code-flower/pm2-health-check

# upload secrets file using sftp

# copy letsencrypt cert files from codeflower-admin server using syncCerts script

# start server 
# must do this before generating the startup script below
npm run prod

# save processes
pm2 save

# generate startup script for reboots
pm2 startup

# take image of server



