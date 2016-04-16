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
const ngTemplates = require('gulp-ng-templates');
const concat = require('gulp-concat');
const removeCode = require('gulp-remove-code');

/////////////// BUNDLER ///////////////////

function bundle() {
  return browserify('./client/js/require.js')
    .transform(babelify, { presets: ['es2015'] })
    .transform(envify({ NODE_ENV: argv.env || 'development' }))
    .on('error', console.log)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./client/dist/js/'))
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
    .pipe(gulp.dest('./client/dist/css/'))
    .pipe(browserSync.stream());
}

gulp.task('sass', sassify);

/////////////// COPY TASKS //////////////////

function copyIndex() {
  return gulp.src('./client/index.html')
    .pipe(gulp.dest('./client/dist'));
}

gulp.task('copy:index', copyIndex);

function copyAssets() {
  return gulp.src('./client/assets/**')
    .pipe(gulp.dest('./client/dist/'));
}

gulp.task('copy:assets', copyAssets);

function bundleD3() {
  return gulp.src([
    './client/js/vendor/d3.js',
    './client/js/vendor/d3.geom.js',
    './client/js/vendor/d3.layout.js'
  ])
    .pipe(concat('d3.bundle.js'))
    .pipe(gulp.dest('./client/dist/js/'));
}

gulp.task('bundle:d3', bundleD3);

//////////////// TEMPLATES //////////////////
 
gulp.task('templates', function () {
  return gulp.src('./client/js/**/*.html')
    .pipe(ngTemplates({
      filename: 'templates.js',
      module: 'CodeFlower',
      standalone: false
    }))
    .pipe(gulp.dest('./client/dist/js/'));
});

////////////////// INDEX ////////////////////

function prepIndexFile() {
  return gulp.src('./client/index.html')
    .pipe(removeCode({ production: argv.env === 'production' }))
    .pipe(gulp.dest('./client/dist/'));
}

gulp.task('prep-index', prepIndexFile);

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

gulp.task('open-browser', ['build' ], function() {
  browserSync.init({ 
    ui: { port: appConfig.ports.browserSyncUI } 
  });

  gulp.src('').pipe(open({
    app: 'google chrome', 
    uri: 'http://localhost:' + appConfig.ports.HTTP
  }));
});

/////////////// DEFAULT TASK ///////////////

gulp.task('build', ['bundle', 'sass', 'templates', 'bundle:d3', 'copy:index', 'copy:assets']);

gulp.task('default', ['watch:server', 'watch:js', 'watch:sass', 'open-browser']);



