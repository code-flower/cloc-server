///////////////// MODULES ////////////////////

const gulp = require('gulp');
const browserify = require('browserify');
const envify = require('envify/custom');
const babelify = require('babelify');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
const open = require('gulp-open');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const argv = require('yargs').argv;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const ngTemplates = require('gulp-ng-templates');
const concat = require('gulp-concat');
const removeCode = require('gulp-remove-code');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const ngAnnotate = require('gulp-ng-annotate');
const bulkify = require('bulkify');
const fs = require('fs');

const appConfig = require('./shared/appConfig');

///////////////// CONSTANTS //////////////////

// the directory where the front-end files are served
const DIST = './client/dist';

// a temporary directory used for production builds
const TMP = './client/tmp';

// dev or prod
const ENV = argv.env || process.env.NODE_ENV || 'development';

/////////////// GLOBAL VARS //////////////////

// this is set in the 'build' task below.
// it determines the target directory for
// all of the build tasks
var buildDir;

///////////////// BUNDLER ////////////////////

gulp.task('bundle', function() {
  return browserify('./client/js/require.js')
    .transform(bulkify)
    .transform(babelify, { presets: ['es2015'] })
    .transform(envify({ NODE_ENV: ENV }))
    .on('error', console.log)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(ngAnnotate())
    .pipe(ENV === 'production' ? uglify() : gutil.noop())
    .pipe(gulp.dest(`${buildDir}/js/`))
    .pipe(browserSync.stream());
});

////////////////// SASS //////////////////////

gulp.task('sass', function() {
  return gulp.src('./client/scss/index.scss')
    .pipe(sass({
      outputStyle: ENV === 'production' ? 'compressed' : 'nested'
    })
    .on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest(`${buildDir}/css/`))
    .pipe(browserSync.stream());
});

////////////////// TEMPLATES /////////////////
 
gulp.task('templates', function() {
  return gulp.src('./client/js/app/partials/**/*.html')
    .pipe(ngTemplates({
      filename: 'templates.js',
      module: 'CodeFlower',
      path: function(path, base) {
        return appConfig.paths.partials + path.replace(base, '');
      },
      standalone: false
    }))
    .pipe(gulp.dest(`${buildDir}/js/`))
    .pipe(browserSync.stream());
});

///////////////// COPY TASKS //////////////////

gulp.task('copy:index', function() {
  return gulp.src('./client/index.html')
    .pipe(removeCode({ 
      removeScript: ENV === 'production'
    }))
    .pipe(gulp.dest(buildDir))
    .pipe(browserSync.stream());
});

gulp.task('copy:assets', function() {
  return gulp.src('./client/assets/**')
    .pipe(gulp.dest(buildDir));  
});

gulp.task('copy:d3', function() {
  return gulp.src([
    './client/js/vendor/d3.js',
    './client/js/vendor/d3.geom.js',
    './client/js/vendor/d3.layout.js'
  ])
    .pipe(concat('d3.bundle.js'))
    .pipe(ENV === 'production' ? uglify() : gutil.noop())
    .pipe(gulp.dest(`${buildDir}/js/`));
});

/////////////////// CLEAN /////////////////////

gulp.task('clean:dist', function() {
  return gulp.src(DIST, { read: false })
    .pipe(clean());
});

gulp.task('tmp-to-dist', function(callback) {
  fs.rename(TMP, DIST, callback);
});

////////////////// DEV TASKS //////////////////

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
    setTimeout(browserSync.reload, 500);
  });
});

gulp.task('watch:js', function() {
  gulp.watch(['./client/js/**/*.js'], ['bundle']);
});

gulp.task('watch:sass', function() {
  gulp.watch(['./client/scss/**/*.scss'], ['sass']);
});

gulp.task('watch:partials', function() {
  gulp.watch(['./client/js/app/partials/**/*.html'], ['templates']);
});

gulp.task('watch:index', function() {
  gulp.watch(['./client/index.html'], ['copy:index']);
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

///////////// BUILD AND DEFAULT //////////////

gulp.task('build', function(callback) {
  console.log("BUILD ENVIRONMENT:", ENV);

  const tasks = [
    'bundle',
    'sass',
    'templates',
    'copy:assets',
    'copy:index',
    'copy:d3'
  ];

  // For development, build directly into the dist folder, and the watchers
  // send their files to dist. But for production, build into the tmp folder
  // and then switch tmp to dist at the end, avoiding server downtime during 
  // the build process. 

  if (ENV === 'production') {
    buildDir = TMP;
    runSequence(tasks, 'clean:dist', 'tmp-to-dist', callback);
  } else {
    buildDir = DIST;
    runSequence('clean:dist', tasks, callback);
  }
});

gulp.task('default', function() {
  runSequence('build', ['watch:js', 'watch:sass', 'watch:partials', 'watch:index', 'open-browser'], 'watch:server');
});


