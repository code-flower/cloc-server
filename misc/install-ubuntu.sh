#!bin/bash

# add these environment vars to the end of the .bashrc file
export codeflower_cert_dir="/etc/letsencrypt/live/api.codeflower.la/"
export external_ip_address=$(hostname -I | cut -d ' ' -f 1)

# install git
sudo apt-get update
sudo apt-get install git

# install build tools
sudo apt-get install build-essential

# clone and enter this repo
git clone https://github.com/code-flower/cloc-server.git
cd cloc-server

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
source ~/.bashrc
command -v nvm      # should display nvm

# install node
nvm install         # installs the version in the .nvmrc file

# install global npm packages
npm install -g cloc
npm install -g pm2
npm install -g nodemon

# install local npm packages
npm install

# install pm2 modules
pm2 install code-flower/pm2-cautious-reload
pm2 install code-flower/pm2-autohook
pm2 install pm2-health-check

# upload secrets file
scp secrets.js root@api.codeflower.la:/root/cloc-server

# generate startup script for reboots
pm2 startup

# save a snapshot of the server



