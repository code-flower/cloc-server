const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const open = require('gulp-open');
const source = require('vinyl-source-stream');
const appConfig = require('./shared/appConfig.js');

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

