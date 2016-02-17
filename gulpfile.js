var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var open = require('gulp-open');

gulp.task('watch:server', function() {
  nodemon({
    script: 'server/server.js',
    ext: 'js',
    ignore: [
      'client/**',
      'server/repos/**',
      'gulpfile.js'
    ]
  }).on('restart', function() {
    setTimeout(function() {
      browserSync.reload();
    }, 1000);
  });
});

gulp.task('watch:client', function() {
  gulp.watch(['./client/**'])
    .on('change', function() {
      browserSync.reload();
    });
});

gulp.task('browser-sync', function() {
  browserSync.init({
    // not using browserSync as a server
    // since the node server serves the static files
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

gulp.task('default', ['watch:server', 'watch:client', 'browser-sync', 'open-chrome']);

