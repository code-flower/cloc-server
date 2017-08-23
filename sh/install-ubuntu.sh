#!bin/bash

# install git
sudo apt-get update
sudo apt-get install git

# clone and enter this repo
git clone https://github.com/code-flower/cloc-server.git
cd cloc-server

# install 
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
source ~/.bashrc
command -v nvm      # displays nvm

# install node
nvm install         # installs version in nvmrc file

# install global npm packages
npm install -g cloc
npm install -g pm2
npm install -g nodemon

# install local npm packages
npm install

# upload creds using sftp

# upload dev cert using sftp

