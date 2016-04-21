
#### Running the Dev Environment

`gulp`


#### How to Build

`gulp build [--env=production] [--chrome]`


#### Running the App on a Server

1. add a gmail-credentials.js file to the root
2. install cloc globally (see below)
3. install node forever globally
4. clone the repo
5. `npm install`
6. `gulp build --env=production`
7. `npm start` (or `npm forever` to run with node forever)


#### Installing the right version of cloc

1. `npm install -g cloc`
2. `cloc --version`
  - this should show the version of the STABLE release
    - https://github.com/AlDanial/cloc/releases/tag/v1.66
3. `which cloc`
  - shows you the location of the program (/usr/local/bin/cloc)
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

