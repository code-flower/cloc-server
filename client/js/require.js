// vendor
require('angular');
require('./vendor/ui-bootstrap-custom-tpls-1.2.1');

// main
require('./app/app');

// directives
require('./app/directives/appContainer');
require('./app/directives/flowerControl');
require('./app/directives/flowerLanguages');
require('./app/directives/flowerTerminal');
require('./app/directives/flowerViz');
require('./app/directives/ignoredFiles');
require('./app/directives/userPrefs');

// factories
require('./app/factories/CodeFlower');
require('./app/factories/dataService');
require('./app/factories/dbAccess');
require('./app/factories/flowerUtils');
require('./app/factories/HTTP');
require('./app/factories/state');
require('./app/factories/userPrefsService');
require('./app/factories/WS');
require('./app/factories/createCSSSelector');

// controllers
require('./app/controllers/credentialsModal');
require('./app/controllers/dispatcher');
require('./app/controllers/mainModal');





