const gulp = require('gulp');
const browserify = require('browserify');
const envify = require('envify/custom');
const babelify = require('babelify');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const open = require('gulp-open');
const source = require('vinyl-source-stream');
const argv = require('yargs').argv;
const appConfig = require('./shared/appConfig.js');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

/////////////// BUNDLER ///////////////////

function bundle() {
  return browserify('./client/js/require.js')
    .transform(babelify, { presets: ['es2015'] })
    .transform(envify({ NODE_ENV: argv.env || 'development' }))
    .on('error', console.log)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./client/dist/'))
    .pipe(browserSync.stream());
}

gulp.task('bundle', bundle);

//////////////// SASS //////////////////////

function sassify() {
  return gulp.src('./client/scss/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('./client/dist'))
    .pipe(browserSync.stream());
}

gulp.task('sass', sassify);

/////////// DEFAULT TASK COMPONENTS /////////

gulp.task('watch:server', function() {
  return nodemon({
    script: 'server/index.js',
    ext: 'js',
    ignore: [
      'client/**',
      'repos/**',
      'gulpfile.js'
    ]
  }).on('start', bundle);
});

gulp.task('watch:js', function() {
  gulp.watch(['./client/js/**/*.{js,html}'], bundle);
});

gulp.task('watch:sass', function() {
  gulp.watch(['./client/scss/**/*.scss'], sassify);
});

gulp.task('open-browser', ['bundle', 'sass'], function() {
  browserSync.init({ 
    ui: { port: appConfig.ports.browserSyncUI } 
  });

  gulp.src('').pipe(open({
    app: 'google chrome', 
    uri: 'http://localhost:' + appConfig.ports.HTTP
  }));
});

/////////////// DEFAULT TASK ///////////////

gulp.task('default', ['watch:server', 'watch:js', 'watch:sass', 'open-browser']);

