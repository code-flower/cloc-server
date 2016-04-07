// vendor
require('angular');
require('./vendor/ui-bootstrap-custom-tpls-1.2.1');

// main
require('./app/app');

// directives
require('./app/directives/appContainer');
require('./app/directives/flowerControl');
require('./app/directives/flowerTerminal');
require('./app/directives/flowerViz');
require('./app/directives/flowerLanguages');

// factories
require('./app/factories/WS');
require('./app/factories/HTTP');
require('./app/factories/CodeFlower');
require('./app/factories/dbAccess');
require('./app/factories/flowerUtils');
require('./app/factories/dataService');
require('./app/factories/state');
require('./app/factories/userPrefs');

// controllers
require('./app/controllers/dispatcher');
require('./app/controllers/credentialsModal');
require('./app/controllers/prefsModal');





