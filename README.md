git-viz
==========

Visualize any public git repo.

Forked from <a href="https://github.com/fzaninotto/CodeFlower">fzaninotto/CodeFlower</a>. 
Built with <a href="https://github.com/mbostock/d3">d3.js</a>



HOW TO RUN THE DEV ENVIRONEMNT:

gulp -- from the root of the repo 



RUN THE CHROME EXTENSION LOCALLY, BUT USING A LIVE SERVER
1. install cloc globally on the server
2. clone the repo on the server
3. npm install on the server
4. npm start on the server
5. 'gulp build --env=production --chrome' locally, then refresh browser window containing the extension


HOW TO BUILD

gulp bundle --env=production
  - the env is option, if set will add the hostname


HOW TO INSTALL THE RIGHT VERSION OF CLOC

- note we use the global version of cloc, not the local, because cloc is called as a shell script within the app

1. npm install -g cloc

2. cloc --version 
  - this should show the version of the STABLE release
    - https://github.com/AlDanial/cloc/releases/tag/v1.66

3. which cloc
  - shows you the location of the program (/usr/local/bin/cloc)

4. subl [location of cloc]
  - open cloc in the editor, then replace the code with the LATEST release
    - https://raw.githubusercontent.com/AlDanial/cloc/master/cloc

5. cloc --version
  - this should show the version of the latest release


RUNNING THE APP ON A SERVER
1. install cloc globally (see above)
2. clone the repo
3. npm install
4. gulp build --env=production
5. npm start

