// vendor
require('angular');
require('./vendor/ui-bootstrap-custom-tpls-1.2.1.js');

// main
require('./app/app.js');

// directives
//require('./app/directives/flowerContainer.js');
require('./app/directives/appContainer.js');
require('./app/directives/flowerControl.js');
require('./app/directives/flowerTerminal.js');
require('./app/directives/flowerViz.js');
require('./app/directives/flowerLanguages.js');

// factories
require('./app/factories/WS.js');
require('./app/factories/HTTP.js');
require('./app/factories/CodeFlower.js');
require('./app/factories/dbAccess.js');
require('./app/factories/flowerUtils.js');
require('./app/factories/dataService.js');
require('./app/factories/state.js');

// controllers
require('./app/controllers/dispatcher.js');
require('./app/controllers/credentialsModal.js');





