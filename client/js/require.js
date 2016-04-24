// vendor
require('angular');
require('./vendor/ui-bootstrap-custom-tpls-1.2.1');

// main
require('./app/app');

// controllers
require('./app/controllers/dispatcher');
require('./app/controllers/modals/credentialsModal');
require('./app/controllers/modals/mainModal');
require('./app/controllers/modals/maxNodesModal');

// directives
require('./app/directives/appContainer');
require('./app/directives/flowerControl');
require('./app/directives/flowerLanguages');
require('./app/directives/flowerTerminal');
require('./app/directives/flowerViz');
require('./app/directives/modals/contactMe');
require('./app/directives/modals/ignoredFiles');
// require('./app/directives/modals/userPrefs');

// factories
require('./app/factories/createCSSSelector');
require('./app/factories/CodeFlower');
require('./app/factories/colorSchemes');
require('./app/factories/dataService');
require('./app/factories/dbAccess');
require('./app/factories/flowerUtils');
require('./app/factories/HTTP');
require('./app/factories/state');
// require('./app/factories/userPrefsService');
require('./app/factories/WS');






