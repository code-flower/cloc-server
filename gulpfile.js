var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

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
    browserSync.reload();
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
    server: {
      baseDir: './client',
    },
    ui: {
      port: 8090
    }
  });
});

gulp.task('default', ['watch:server', 'watch:client', 'browser-sync']);

