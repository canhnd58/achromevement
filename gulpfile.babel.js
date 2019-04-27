import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import watchify from 'watchify';
import browserify from 'browserify';
import babelify from 'babelify';
import envify from 'envify/custom';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import del from 'del';
import log from 'fancy-log';
import chalk from 'chalk';

const $ = gulpLoadPlugins();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const RELEASE = process.env.NODE_ENV === 'production';

const dirs = { SOURCE: 'src', DEST: 'dist' };

const staticFiles = [
  `${dirs.SOURCE}/manifest.json`,
  `${dirs.SOURCE}/img/**/*`,
  `${dirs.SOURCE}/css/**/*`,
  `${dirs.SOURCE}/html/**/*`,
];

const jsComponents = ['BG', 'CS', 'PU', 'OP'];

const logError = function(err) {
  if (err.fileName) {
    log(
      `${chalk.red(err.name)}: ${chalk.yellow(err.fileName)}` +
        `: Line ${chalk.magenta(err.lineNumber)}` +
        ` & Column ${chalk.magenta(err.columnNumber || err.column)}` +
        `: ${chalk.blue(err.description)}`
    );
  } else {
    log(`${chalk.red(err.name)}: ${chalk.yellow(err.message)}`);
  }
  this.emit('end');
};

const createBundle = (jsComponent, watch) => {
  const opts = {
    ...watchify.args,
    entries: [`${dirs.SOURCE}/js/${jsComponent}/index.js`],
    extensions: ['.js'],
    paths: ['./node_modules', `${dirs.SOURCE}/js/`],
    debug: !RELEASE,
  };

  let b = browserify(opts);
  b.transform(babelify.configure({ compact: RELEASE })).transform(
    envify({
      _: 'purge',
      NODE_ENV: process.env.NODE_ENV,
    })
  );

  const rebundle = () =>
    b
      .bundle()
      .on('error', logError)
      .pipe(source(`${jsComponent}.js`))
      .pipe(buffer())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.if(RELEASE, $.uglify()))
      .pipe($.sourcemaps.write('./maps'))
      .pipe(gulp.dest(dirs.DEST))
      .pipe($.if(watch, $.livereload()));

  if (watch) {
    b = watchify(b);
    b.on('update', rebundle);
    b.on('log', log);
  }
  return rebundle;
};

const copyStatic = () => gulp.src(staticFiles).pipe(gulp.dest(dirs.DEST));

gulp.task('clean', () => del([dirs.DEST]));

gulp.task('build:static', copyStatic);
gulp.task('watch:static', () => {
  copyStatic();
  return gulp.watch(staticFiles, copyStatic);
});

jsComponents.forEach(c => {
  gulp.task(`build:js:${c}`, createBundle(c, false));
});

gulp.task('build:js', gulp.parallel(jsComponents.map(c => `build:js:${c}`)));

gulp.task('livereload', cb => {
  $.livereload.listen();
  cb();
});

jsComponents.forEach(c => {
  gulp.task(`watch:js:${c}`, createBundle(c, true));
});

gulp.task(
  'watch:js',
  gulp.series(
    'livereload',
    gulp.parallel(jsComponents.map(c => `watch:js:${c}`))
  )
);

gulp.task('build', gulp.parallel('build:js', 'build:static'));
gulp.task('watch', gulp.parallel('watch:js', 'watch:static'));

gulp.task('dev', gulp.series('clean', 'watch'));
gulp.task('default', gulp.series('dev'));
