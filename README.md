
#### See the app

[codeflower.la](http://codeflower.la)


#### Running the Dev Environment

`gulp`


#### How to Build

`gulp build [--env=production]`

The production flag will cause assets to be minified.


#### Deploying to production

1. install the node version manager
  -- see https://github.com/creationix/nvm for the command

2. use `nvm` to install node version 6.9.1 
  
  ```nvm install 6.9.1.```

3. use `npm` to globally install `gulp`, `cloc`, and `forever`

4. clone the repo

5. create a file at private/gmail-credentials.js that contains this:

  ```
  module.exports = {
    email:    '[gmail address]',
    password: '[gmail password]'
  };
  ```

6. install an SSL certificate and set up automatic renewal
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

7. `npm install`

8. `npm run deploy`
  - this will build a production version of the app and start node forever


