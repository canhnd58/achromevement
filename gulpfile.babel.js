import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins'; import watchify from 'watchify';
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
  `${dirs.SOURCE}/style/**/*.css`,
  `${dirs.SOURCE}/*.html`,
  `${dirs.SOURCE}/manifest.json`,
];

const bundleOptions = [
  {
    entries: [`${dirs.SOURCE}/background/main.js`],
    output: 'background.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
  {
    entries: [`${dirs.SOURCE}/content/main.js`],
    output: 'content.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
  {
    entries: [`${dirs.SOURCE}/popup/main.js`],
    output: 'popup.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
  {
    entries: [`${dirs.SOURCE}/options/main.js`],
    output: 'options.js',
    extensions: ['.js'],
    destination: dirs.DEST,
  },
];

const logError = (err) => {
  if (err.fileName) {
    log(
      `${chalk.red(err.name)}: ${chalk.yellow(err.fileName)}` +
      `: Line ${chalk.magenta(err.lineNumber)}` +
      ` & Column ${chalk.magenta(err.columnNumber || err.column)}` +
      `: ${chalk.blue(err.description)}`);
  }
  else {
    log(`${chalk.red(err.name)}: ${chalk.yellow(err.message)}`);
  }
}

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
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(options.destination))
    .pipe($.if(watch, $.livereload()));

  if (watch) {
    b = watchify(b);
    b.on('update', rebundle);
    b.on('log', log);
  }

  return rebundle();
}

const bundle = (watch) => Promise.all(bundleOptions.map(options => createBundle(options, watch)));

gulp.task('clean', () => del([dirs.DEST]));

gulp.task('build:static', () => gulp.src(staticFiles).pipe(gulp.dest(dirs.DEST)));
gulp.task('watch:static', gulp.series(
  'build:static', 
  () => gulp.watch(staticFiles, gulp.series('build:static')))
);

gulp.task('build:js', () => bundle(false));
gulp.task('watch:js', () => {
  $.livereload.listen();
  return bundle(true);
});

gulp.task('build', gulp.parallel('build:js', 'build:static'));
gulp.task('watch', gulp.parallel('watch:js', 'watch:static'));

gulp.task('dev', gulp.series('clean', 'watch'));
gulp.task('default', gulp.series('dev'));
