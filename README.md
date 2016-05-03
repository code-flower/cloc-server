
#### See the app

[codeflower.la](http://codeflower.la)


#### Running the Dev Environment

`gulp`


#### How to Build

`gulp build [--env=production] [--chrome]`

The production flag will cause assets to be minified. The chrome flag will add to the build the files necessary to run the app as a chrome extension.


#### Deploying to production

1. install the right version cloc globally (see below)
2. install node forever globally
3. clone the repo
4. create a file at private/gmail-credentials.js that contains this:
```
module.exports = {
  email:    '[gmail address]',
  password: '[gmail password]'
};
```
5. `npm install`
6. `gulp run deploy`
  - this will build a production version of the app and start node forever


#### Installing the right version of cloc

1. `npm install -g cloc`
2. `cloc --version`
  - this should show the version of the STABLE release
    - https://github.com/AlDanial/cloc/releases/tag/v1.66
3. `which cloc`
  - shows you the location of the program (probably /usr/local/bin/cloc)
4. `subl [location of cloc]`
  - open cloc in the editor, then replace the code with the LATEST release
    - https://raw.githubusercontent.com/AlDanial/cloc/master/cloc
5. `cloc --version`
  - this should show the version of the latest release


#### Run the Chrome extension locally, but with a live server

1. install cloc globally on the server
2. clone the repo on the server
3. `npm install` on the server
4. `npm start` on the server
5. `gulp build --env=production --chrome` locally, then refresh browser window containing the extension

