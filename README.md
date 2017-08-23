

## Overview
This server generates hierarchically-organized cloc data for a given git repository. This data is useful for visualizing the repository, and possibly for other things.

When the server receives a request, it starts by cloning the repository on the server. Then it uses the `cloc` program to determine the length and type of code for each code file in the repository. Then it converts the `cloc` data to a JSON object whose structure matches the file structure of the repository. Finally, it returns the JSON to the client.

## Requests
The server accepts secure requests over both HTTP and Websockets. In both cases, the client receives a `success` response if the cloc analysis is successful, and an `error` response if not. If Websockets is used, the client also receives numerous `update` responses while the server is analyzing the repo. 

Regardless of what protocol is used, a request to the server contains the following parameters:

1. owner -- the owner of the repo
2. name -- the name of the repo
3. branch -- the branch to be analyzed. This is optional, and defaults to the default branch (typically, master).
4. username -- a github username. Required only for private repos.
5. password -- a github password. Required only for private repos.

The specific format for the two protocols is discussed below.

### HTTP Requests
The server accepts both GET and POST requests over https. If a GET request is used, the pathname must be `cloc` and the parameters should be included in the query string, e.g. --
```
GET: https://localhost:8000/cloc?owner=mrcoder&name=theproject&branch=develop
```
If a POST is used, the pathname must again be `cloc` and the parameters should be included as stringified JSON in the body of the request, e.g. --
```
POST: https://localhost:8000/cloc
where the body is the output of 
JSON.stringify({
    owner: "mrcoder",
    name: "theproject",
    branch: "develop",
    username: "hi",
    password: "there
})
```

### Websockets Requests
If the client uses Websockets, the request should be sent to `wss://localhost:8000` (no pathname), and message should be a stringified JSON object with `endpoint` and `params` properties. The `endpoint` must be `cloc`, and the params should contain the data discussed above, for example:
```
JSON.stringify({
    endpoint: "cloc",
    params: {
        owner: "mrcoder",
        name: "theproject",
        branch: "develop",
        username: "hi",
        password: "there
    }
})
```

## Responses
All responses (over both HTTP and Websockets) are JSON objects with exactly two properties: `type` and `data`. The three types of responses are illustrated below.

### success
If a request is successful, the server will return the following (as an example):
```
{
    type: 'success',
    data: {
        owner: 'code-flower',
        name: 'client-web',
        branch: 'new-ui',
        fullName: 'code-flower/client-web',
        fNameBr: 'code-flower/client-web::new-ui',
        lastCommit: 'd64bc6686057092941fa17548def6d9e0a291110',
        githubUrl: 'https://github.com/code-flower/client-web/tree/new-ui'
        cloc: {
            tree: { name: 'root', children: [Object] },
            ignored: '.gitignore: listed in $Not_Code_Extension{gitignore}\n'
        }
    }
}
```

### error
For errors, the server will returns the following:
```
{
    type: 'error',
    data: {
        name: 'RepoNotFound',
        message: 'The requested repo could not be found',
        statusCode: 404,
        ...optional other data, such as params: [the request params],
    }
}
```
The various types of errors, and their codes and messages, are listed in `config/api.config.js`. 

### update (websockets only)
Websockets requests will receive updates in this format:
```
{
    type: 'update',
    data: {
        text: 'cloning into code-flower/client-web...'
    }
}
```


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


