#!bin/bash

# install git
sudo apt-get update
sudo apt-get install git

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

# install letsencrypt cert
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
certbot certonly --standalone -d api.codeflower.la

# upload creds to /root/codeflower-creds using scp
# run this command on local from the root of this repo
scp -r creds root@api.codeflower.la:/root/codeflower-creds

# add these environment vars to the end of the .bashrc file
export codeflower_cert_dir="/etc/letsencrypt/live/api.codeflower.la/"
export codeflower_creds_dir="/root/codeflower-creds/"

# save an image of the server



