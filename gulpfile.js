var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var open = require('gulp-open');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');

/////////////// SUB-TASKS ///////////////////

gulp.task('bundle', function() {
  return browserify('./client/js/index.js')
    .transform(babelify, {presets: ["es2015"]})
    .on('error', function(err) {console.log(err);})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./client/js/'))
    .pipe(browserSync.stream());
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
  gulp.watch(['./client/**', '!./client/js/bundle.js'], ['bundle']);
});

gulp.task('browser-sync', function() {
  browserSync.init({ ui: { port: 8090 } });
});

gulp.task('open-chrome', ['bundle'], function() {
  gulp.src('')
    .pipe(open({
      app: 'google chrome', 
      uri: 'http://localhost:8000'
    }));
});

/////////////// DEFAULT TASK ///////////////

gulp.task('default', ['watch:server', 'watch:client', 'browser-sync', 'open-chrome']);

