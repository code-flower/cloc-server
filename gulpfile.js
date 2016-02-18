var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var open = require('gulp-open');
var browserify = require('browserify');
var source = require('vinyl-source-stream');


/////////////// SUB-TASKS ///////////////////

gulp.task('bundle', function() {
  var bundler = browserify();
  return bundler
    .add('./client/js/index.js')
    .bundle()
    .pipe(source('./bundle.js'))
    .pipe(gulp.dest('./client/js/'));
});

gulp.task('bundle-and-reload', ['bundle'], function() {
  browserSync.reload();
});

/////////// DEFAULT TASK COMPONENTS /////////

gulp.task('watch:server', function() {
  nodemon({
    script: 'server/server.js',
    ext: 'js',
    ignore: [
      'client/**',
      'server/repos/**',
      'server/samples/**',
      'gulpfile.js'
    ]
  }).on('restart', function() {
    setTimeout(function() {
      browserSync.reload();
    }, 1000);
  });
});

gulp.task('watch:client', function() {
  gulp.watch(['./client/**'], ['bundle-and-reload']);
});

gulp.task('browser-sync', function() {
  browserSync.init({
    // Not using browserSync as a server since the node server serves the static files.
    // Unfortunately this requires a script to be added to index.html.
    // server: {
    //   baseDir: './client',
    // },
    ui: {
      port: 8090
    }
  });
});

gulp.task('open-chrome', function() {
  gulp.src('')
    .pipe(open({
      app: 'google chrome', 
      uri: 'http://localhost:8000'
    }));
});

/////////////// DEFAULT TASK ///////////////

gulp.task('default', ['watch:server', 'watch:client', 'browser-sync', 'open-chrome']);

