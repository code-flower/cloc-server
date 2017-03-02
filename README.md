
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

6. get and install an https certificate in the ```server/HTTP/cert``` directory
  1. install the letsencrypt client (https://letsencrypt.org/getting-started/)
  2. run ```./letsencrypt-auto certonly``` and use the ```standalone``` option. This will create 4 files somewhere on the machine.
  3. copy those files into the ```server/HTTP/cert``` directory

7. `npm install`

8. `npm run deploy`
  - this will build a production version of the app and start node forever



