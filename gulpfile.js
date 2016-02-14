var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var open = require('gulp-open');

gulp.task('welcome', function() {
  console.log("welcome");
});

gulp.task('dir', function() {
  console.log(__dirname);
});

gulp.task('watch:client', function() {
  livereload.listen();
  gulp.watch('client/**', ['welcome']);
});

gulp.task('dev:server', function() {
  nodemon({
    script: 'server/server.js',
    ext: 'js',
    ignore: [
      'gulpfile.js',
      'client/**',
      'server/repos/**',
      'server/cloc-data/**',
      'server/reasons.txt'
    ]
  });
});

gulp.task('dev:open', function() {
  gulp.src('')
    .pipe(open({
      app: 'google chrome', 
      uri: 'http://localhost:8000'
    }));
});

gulp.task('dev', ['dev:server', 'dev:open']);
