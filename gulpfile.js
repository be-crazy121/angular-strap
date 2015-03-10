'use strict';

var gulp = require('gulp');
var config = require('ng-factory').use(gulp, {
  src: {
    docsViews: '*/docs/{,*/}*.tpl.{html,jade}'
  },
  bower: {
    exclude: /jquery|js\/bootstrap|\.less|\.woff2/
  }
});

//
// Aliases

gulp.task('serve', ['ng:serve']);
gulp.task('build', ['ng:build']);
gulp.task('pages', ['ng:pages']);
// gulp.task('test', ['ng:test']);

//
// Hooks

var fs = require('fs');
var path = require('path');
var src = config.src;
// gulp.task('ng:afterBuild', function() {
//   // gulp.src(['bower_components/font-awesome/fonts/*.woff'], {cwd: src.cwd})
//   //   .pipe(gulp.dest(path.join(src.dest, 'fonts')));
//   gulp.src(['bower_components/angular-strap/dist/modules/*.js'], {cwd: src.cwd, base: src.cwd})
//     .pipe(gulp.dest(src.dest));
//   gulp.src(['bower_components/socket.io-client/*.js'], {cwd: src.cwd, base: src.cwd})
//     .pipe(gulp.dest(src.dest));
//   gulp.src(['libraries/**/*.js'], {cwd: src.cwd, base: src.cwd})
//     .pipe(gulp.dest(src.dest));
//   // gulp.src(['data/**/*'], {cwd: path.join(src.cwd, '..')})
//   //   .pipe(gulp.dest(path.join(src.dest, 'data')));
//   try {
//     fs.symlinkSync('./../data', path.join(src.dest, 'data'));
//   } catch(err) {}
// });

var docs = config.docs;
gulp.task('ng:afterPages', function() {
  // gulp.src(['bower_components/font-awesome/fonts/*.{woff,woff2}'], {cwd: docs.cwd})
    // .pipe(gulp.dest(path.join(docs.dest, 'fonts')));
  gulp.src(['bower_components/highlightjs/styles/github.css'], {cwd: docs.cwd, base: docs.cwd})
    .pipe(gulp.dest(docs.dest));
});

// Tests
//

var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var testTimezone = '';
gulp.task('jshint', function() {
  gulp.src(src.scripts, {cwd: src.cwd})
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});
var karma = require('karma').server;
gulp.task('karma:unit', ['ng:test/templates'], function() {
  // if testTimezone has value, set the environment timezone
  // before starting karma, so PhantomJS picks up the
  // timezone setting
  if (testTimezone) {
    console.log('Setting timezone to => [' + testTimezone + ']');
    process.env.TZ = testTimezone;
  }
  karma.start({
    configFile: path.join(__dirname, 'test/karma.conf.js'),
    browsers: ['PhantomJS'],
    reporters: ['dots'],
    singleRun: true
  }, function(code) {
    gutil.log('Karma has exited with ' + code);
    process.exit(code);
  });
});
gulp.task('karma:server', ['ng:test/templates'], function() {
  karma.start({
    configFile: path.join(__dirname, 'test/karma.conf.js'),
    browsers: ['PhantomJS'],
    reporters: ['progress'],
    autoWatch: true,
    singleRun: false
  }, function(code) {
    gutil.log('Karma has exited with ' + code);
    process.exit(code);
  });
});
// codeclimate-test-reporter
gulp.task('karma:travis', ['ng:test/templates'], function() {
  karma.start({
    configFile: path.join(__dirname, 'test/karma.conf.js'),
    browsers: ['PhantomJS'],
    reporters: ['dots', 'coverage'],
    singleRun: true
  }, function(code) {
    gutil.log('Karma has exited with ' + code);
    process.exit(code);
    // gulp.src('test/coverage/**/lcov.info')
    //   .pipe(coveralls())
    //   .on('end', function() {
    //     process.exit(code);
    //   });
  });
});
gulp.task('karma:travis~1.2.0', ['ng:test/templates'], function() {
  karma.start({
    configFile: path.join(__dirname, 'test/~1.2.0/karma.conf.js'),
    browsers: ['PhantomJS'],
    reporters: ['dots'],
    singleRun: true
  }, function(code) {
    gutil.log('Karma has exited with ' + code);
    process.exit(code);
  });
});

gulp.task('test', function() {
  runSequence('ng:test/clean', 'ng:test/templates', ['jshint', 'karma:unit']);
});
gulp.task('test:timezone', function() {
  // parse command line argument for optional timezone
  // invoke like this:
  //     gulp test:timezone --Europe/Paris
  var timezone = process.argv[3] || '';
  testTimezone = timezone.replace(/-/g, '');
  runSequence('ng:test/clean', 'ng:test/templates', ['jshint', 'karma:unit']);
});
gulp.task('test:server', function() {
  runSequence('ng:test/clean', 'ng:test/templates', 'karma:server');
});
