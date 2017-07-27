///////////////// MODULES ////////////////////

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

const saveSamples = require('./server/system').saveSamples;
const appConfig = require('./shared/appConfig');

/////////// CONSTRUCT SAMPLES FILE ///////////

gulp.task('samples', function() {
  saveSamples('./samples.json');
});

//////////////// DEV SERVER //////////////////

gulp.task('default', function() {
  return nodemon({
    script: 'server/index.js',
    ext: 'js',
    ignore: [
      'client/**',
      'repos/**',
      'gulpfile.js'
    ]
  });
});

