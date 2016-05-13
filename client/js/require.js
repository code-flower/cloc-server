/* this is the file that browserify bundles */

// vendor
require('angular');
require('./vendor/ui-bootstrap-custom-tpls-1.2.1');

// all application js
require('bulk-require')(__dirname, ['./app/**/*.js']);
