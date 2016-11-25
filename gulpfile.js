const gulp = require('gulp');
const notify = require("gulp-notify")
const browserify = require('browserify');
const babelify = require("babelify")
const source = require("vinyl-source-stream");
const path = require("path");

function createErrorHandler(title) {
  return function() {
    let args = Array.prototype.slice.call(arguments)
      notify.onError({
        title: title,
        message: "<%= error.message %>",
      }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
  };
}

const handleCompErrors = createErrorHandler("Compile Error");
const handleExeErrors = createErrorHandler("Execution Error");
const handleTestErrors = createErrorHandler("Test Failure");

gulp.task("js", function() {
  production = false;
  browserify({
    debug:true,
    entries: "js/app.js",
  }).transform(babelify, {presets: ["es2015", "react", "stage-2",]})
  .bundle()
  .on('error', handleCompErrors)
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('./bin'));
});

gulp.task("watch", function() {
  gulp.watch(["js/*.js",], ["js",]);
});

gulp.task( "default", ["watch", "js",] );
