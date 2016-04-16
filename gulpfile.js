////////////// MODULES ////////////////////

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
const clean = require('gulp-clean');
const runSequence = require('run-sequence');

/////////////// CONSTANTS /////////////////

const DIST = './client/dist';

/////////////// BUNDLER ///////////////////

gulp.task('bundle', function() {
  return browserify('./client/js/require.js')
    .transform(babelify, { presets: ['es2015'] })
    .transform(envify({ NODE_ENV: argv.env || 'development' }))
    .on('error', console.log)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(`${DIST}/js/`))
    .pipe(browserSync.stream());
});

//////////////// SASS //////////////////////

gulp.task('sass', function() {
  return gulp.src('./client/scss/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest(`${DIST}/css/`))
    .pipe(browserSync.stream());
});

//////////////// TEMPLATES //////////////////
 
gulp.task('templates', function() {
  return gulp.src('./client/js/**/*.html')
    .pipe(ngTemplates({
      filename: 'templates.js',
      module: 'CodeFlower',
      standalone: false
    }))
    .pipe(gulp.dest(`${DIST}/js/`));
});

/////////////// COPY TASKS //////////////////

gulp.task('copy:index', function() {
  return gulp.src('./client/index.html')
    .pipe(removeCode({ removeScript: argv.env === 'production' || argv.chrome }))
    .pipe(gulp.dest(DIST));
});

gulp.task('copy:assets', function() {
  return gulp.src('./client/assets/**')
    .pipe(gulp.dest(DIST));  
});

gulp.task('copy:d3', function() {
  return gulp.src([
    './client/js/vendor/d3.js',
    './client/js/vendor/d3.geom.js',
    './client/js/vendor/d3.layout.js'
  ])
    .pipe(concat('d3.bundle.js'))
    .pipe(gulp.dest(`${DIST}/js/`));
});

gulp.task('copy:chrome', function() {
  return gulp.src('./client/chrome/**')
    .pipe(gulp.dest(DIST));
});

////////////////// CLEAN ////////////////////

gulp.task('clean', function() {
  return gulp.src(DIST, { read: false })
    .pipe(clean());
});

////////////////// DEV TASKS ////////////////

gulp.task('watch:server', function() {
  return nodemon({
    script: 'server/index.js',
    ext: 'js',
    ignore: [
      'client/**',
      'repos/**',
      'gulpfile.js'
    ]
  }).on('start', function() {
    setTimeout(function() {
      gulp.src('').pipe(browserSync.stream());
    }, 500);
  });
});

gulp.task('watch:js', function() {
  gulp.watch(['./client/js/**/*.{js,html}'], ['bundle']);
});

gulp.task('watch:sass', function() {
  gulp.watch(['./client/scss/**/*.scss'], ['sass']);
});

gulp.task('open-browser', function() {
  browserSync.init({ 
    ui: { port: appConfig.ports.browserSyncUI } 
  });

  gulp.src('').pipe(open({
    app: 'google chrome', 
    uri: 'http://localhost:' + appConfig.ports.HTTP
  }));
});

//////////// BUILD AND DEFAULT /////////////

gulp.task('build', function(callback) {
  const tasks = [
    'bundle',
    'sass',
    'templates',
    'copy:assets',
    'copy:index',
    'copy:d3'
  ].concat(argv.chrome ? ['copy:chrome'] : []);

  runSequence('clean', tasks, callback);
});

gulp.task('default', function() {
  runSequence('build', ['watch:js', 'watch:sass', 'open-browser'], 'watch:server');
});


