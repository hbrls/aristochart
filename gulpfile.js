var argv = require('yargs').argv;
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');


gulp.task('build', function () {
  var themes = ['default'];
  if (argv.themes) {
    themes = argv.themes.split(',');
  }

  var outputDev = 'aristochart.js';
  var outputProd = 'aristochart.min.js';
  if (themes.length > 1 || themes[0] !== 'default') {
    outputDev = 'aristochart-' + themes.join('-') + '.js';
    outputProd = 'aristochart-' + themes.join('-') + '.min.js';
  }

  var files = [
    './src/core.js',
    './src/init.js',
    './src/main.js',
    './src/render.js',
  ];
  if (argv.toImage) {
    files.push('./src/to-image-plugin.js');
  }
  if (argv.jquery) {
    files.push('./src/jquery-plugin.js');
  }
  themes.forEach(function (t) {
    files.push('./themes/' + t + '/' + t + '.js');
  });

  gulp
    .src(files)
    .pipe(concat(outputDev))
    .pipe(gulp.dest('./dist'))
    .pipe(rename(outputProd))
    .pipe(replace(/'development' === 'development'/g, '\'production\' === \'development\''))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});


gulp.task('default', ['build']);
