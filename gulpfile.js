const gulp = require('gulp');
const notify = require('gulp-notify');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

function createErrorHandler(title) {
  return function errorHandler(...args) {
    notify.onError({
      title,
      message: '<%= error.message %>',
    }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
  };
}

const handleCompErrors = createErrorHandler('Compile Error');

gulp.task('js', () => {
  browserify({
    debug: true,
    entries: 'js/app.jsx',
  }).transform(babelify, { presets: ['es2015', 'react', 'stage-2'] })
  .bundle()
  .on('error', handleCompErrors)
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('./bin'));
});

gulp.task('watch', () => {
  gulp.watch(['js/*.js', 'js/*.jsx'], ['js']);
});

gulp.task('default', ['watch', 'js']);
