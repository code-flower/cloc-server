var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var open = require('gulp-open');
var source = require('vinyl-source-stream');
var appConfig = require('./shared/appConfig.js');

/////////////// BUNDLER ///////////////////

function bundle() {
  return browserify('./client/js/index.js')
    .transform(babelify, { presets: ["es2015"] })
    .on('error', function(err) { console.log(err); })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./client/dist/'))
    .pipe(browserSync.stream());
}

gulp.task('bundle', bundle);

/////////// DEFAULT TASK COMPONENTS /////////

gulp.task('watch:server', function() {
  return nodemon({
    script: 'server/server.js',
    ext: 'js',
    ignore: [
      'client/**',
      'server/repos/**',
      'server/samples/**',
      'gulpfile.js'
    ]
  }).on('start', bundle);
});

gulp.task('watch:client', function() {
  gulp.watch(['./client/**', '!./client/dist/bundle.js'], bundle);
});

gulp.task('open-browser', ['bundle'], function() {
  browserSync.init({ 
    ui: { port: appConfig.ports.browserSyncUI } 
  });

  gulp.src('').pipe(open({
    app: 'google chrome', 
    uri: 'http://localhost:' + appConfig.ports.HTTP
  }));
});

/////////////// DEFAULT TASK ///////////////

gulp.task('default', ['watch:server', 'watch:client', 'open-browser']);

