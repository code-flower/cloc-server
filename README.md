
## Installation

1. Install git

2. Clone this repo and cd into it

3. Install nvm
  1. see https://github.com/creationix/nvm#calling-nvm-use-automatically-in-a-directory-with-a-nvmrc-file
  for the curl command to install
  2. check installation: `command -v nvm`

4. Use nvm to install node/npm 
  `nvm install`. This will install the correct version (the one in the .nvmrc file). 

5. Use npm to globally install cloc, pm2, and nodemon
  `npm install -g cloc`
  `npm install -g pm2`
  `npm install -g nodemon`

6. Install local packages
  `npm install`

7. Install SSL cert
  1. install the letsencrypt client (https://letsencrypt.org/getting-started/). This will install the `certbot-auto` program used to generate the certificate. 

  2. generate the SSL certificate

    ```
    ./certbot-auto certonly --standalone -d codeflower.la
    ```
    
    This will create four files somewhere on the machine. The path to those files should be the same as the path in `appConfig.certDir`.

  3. set up autorenewal using cron

  Use `crontab -e` to open the crontab file. Then add this line to run the renewal twice a day at a randomly selected minute of 47, per letsencrypt's request. This will only replace the certificate when it's actually close to expiring. It stops the webserver before the replacement, and restarts it afterwards. See https://certbot.eff.org/docs/using.html#renewal. 

  ```
  47 6,15 * * * [PATH TO certbot-auto]/certbot-auto renew --pre-hook "forever stopall" --post-hook "npm run forever --prefix [PATH TO CodeFlower]"
  ```

## Development

To run the app with a nodemon server: `npm run dev`

To run tests against the server: `npm test` (Note: the server must be running first.)

## Deployment

`pm2 start src/server.js --name='codeflower'`
`pm2 monit` to monitor the server
`pm2 show codeflower` to see info about the server

## The API

### Websockets

All websockets payloads consist of a JSON object with a 'type' property, and other optional data. 

#### Types sent to the server

1. clone

Initiates a clone. The data identifies the repo to be cloned. The request can take one of two forms:

{
  type: "clone",
  data: {
    owner:    [repo owner],
    name:     [repo name],
    branch:   [the branch to be cloned -- optional, defaults to the default branch],
    username: [required for private repos],
    password: [required for private repos]
  }
}

#### Types sent to the client

1. update

{
  type: "update",
  data: {
    text: [string of update text]
  }
}

2. error

{
  type: "error",
  data: {
    errorType: [one of config.errorTypes]
    errorData: {}
  }
}

3. success

{
  type: "success",
  data: {
    repo: {
      owner:    [repo owner],
      name:     [repo name],
      branch:   [if branch was provided],
      commit:   [sha of latest commit]        // maybe
      gitUrl:   [url of repo on github]       // maybe
      cloneUrl: [https clone url]             // maybe
    },
    cloc: {
      json:    [json object],
      ignored: [list of ignored files]
    }
  }
}

### HTTP



