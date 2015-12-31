/**
 * @author rik
 */
var browserify = require('browserify');

var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');

var packageJson = require('../package.json');

module.exports = function (gulp) {
  packageJson.browserify.entries = ['node_modules/babel-polyfill/lib/index', packageJson.browserify.entries];
  gulp.task('browserify', function () {
    return doBrowserify(packageJson.browserify);
  });

  function doBrowserify(options) {
    var bundler = browserify(options);

    return bundler.bundle()
      .on('error', function (err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('./build/dst'));
  }
};