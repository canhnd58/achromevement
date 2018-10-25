import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import watchify from 'watchify';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import del from 'del';
import log from 'fancy-log';
import chalk from 'chalk';

const $ = gulpLoadPlugins();
const DEBUG = true;

const dirs = { SOURCE: 'src', DEST: 'dist' };

const staticFiles = [
  `${dirs.SOURCE}/images/**/*`,
  `${dirs.SOURCE}/style/**/*.css`,
  `${dirs.SOURCE}/*.html`,
  `${dirs.SOURCE}/manifest.json`,
];

const bundleOptions = {
  background: {
    entries: [`${dirs.SOURCE}/background/main.js`],
    output: 'background.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
  content: {
    entries: [`${dirs.SOURCE}/content/main.js`],
    output: 'content.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
  popup: {
    entries: [`${dirs.SOURCE}/popup/main.js`],
    output: 'popup.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
  options: {
    entries: [`${dirs.SOURCE}/options/main.js`],
    output: 'options.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
};

const logError = (err) => {
  if (err.fileName) {
    log(
      `${chalk.red(err.name)}: ${chalk.yellow(err.fileName)}` +
      `: Line ${chalk.magenta(err.lineNumber)}` +
      ` & Column ${chalk.magenta(err.columnNumber || err.column)}` +
      `: ${chalk.blue(err.description)}`);
  } else {
    log(`${chalk.red(err.name)}: ${chalk.yellow(err.message)}`);
  }
};

const createBundle = (options, watch) => {
  const opts = {
    ...watchify.args,
    entries: options.entries,
    extensions: options.extensions,
    debug: DEBUG,
  };

  let b = browserify(opts);
  b.transform(babelify.configure({ compact: false }));

  const rebundle = () => b.bundle()
    .on('error', logError)
    .pipe(source(options.output))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.if(!DEBUG, $.uglify()))
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(options.destination))
    .pipe($.if(watch, $.livereload()));

  if (watch) {
    b = watchify(b);
    b.on('update', rebundle);
    b.on('log', log);
  }

  return rebundle();
};

const copyStatic = () => gulp.src(staticFiles).pipe(gulp.dest(dirs.DEST));

gulp.task('clean', () => del([dirs.DEST]));

gulp.task('build:static', copyStatic);
gulp.task('watch:static', () => {
  copyStatic();
  return gulp.watch(staticFiles, copyStatic);
});

gulp.task('build:js:background', () => createBundle(bundleOptions.background, false));
gulp.task('build:js:content', () => createBundle(bundleOptions.content, false));
gulp.task('build:js:popup', () => createBundle(bundleOptions.popup, false));
gulp.task('build:js:options', () => createBundle(bundleOptions.options, false));

gulp.task('build:js', gulp.parallel(
  'build:js:background',
  'build:js:content',
  'build:js:popup',
  'build:js:options',
));

gulp.task('livereload', (cb) => {
  $.livereload.listen();
  cb();
});

gulp.task('watch:js:background', () => createBundle(bundleOptions.background, true));
gulp.task('watch:js:content', () => createBundle(bundleOptions.content, true));
gulp.task('watch:js:popup', () => createBundle(bundleOptions.popup, true));
gulp.task('watch:js:options', () => createBundle(bundleOptions.options, true));

gulp.task('watch:js', () => gulp.series('livereload', gulp.parallel(
  'watch:js:background',
  'watch:js:content',
  'watch:js:popup',
  'watch:js:options',
))());

gulp.task('build', gulp.parallel('build:js', 'build:static'));
gulp.task('watch', gulp.parallel('watch:js', 'watch:static'));

gulp.task('dev', gulp.series('clean', 'watch'));
gulp.task('default', gulp.series('dev'));
