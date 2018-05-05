'use strict';
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var plugins = require('gulp-load-plugins')();

// Create wrap template for all built libraries.
var template = '/*! formiojs v<%= version %> | https://unpkg.com/formiojs@<%= version %>/LICENSE.txt */';
template += "\n";
template += '<%= contents %>';
plugins.template = template;

// Get the package.json info for reference during builds.
plugins.packageJson = require('./package.json');
plugins.source = require('vinyl-source-stream');
plugins.browserify = require('browserify');
plugins.cleanCSS = require('gulp-clean-css');

// Clean lib folder.
gulp.task('clean', require('del').bind(null, ['lib']));

// Run babel on source code.
gulp.task('babel', require('./gulp/babel')(gulp, plugins));

// Move choices.js icons into dist folder.
gulp.task('icons', () => {
  return gulp.src('node_modules/choices.js/assets/icons/*')
    .pipe(gulp.dest('lib/dist/icons'));
});

// Move font-awesome fonts into dist folder.
gulp.task('builder-fonts', () => {
  return gulp.src('node_modules/font-awesome/fonts/*').pipe(gulp.dest('lib/dist/fonts'));
});

// Generate styles
gulp.task('styles', require('./gulp/styles')(gulp, plugins));
gulp.task('styles-builder', ['builder-fonts'], require('./gulp/styles-builder')(gulp, plugins));

// Script builds.
gulp.task('scripts', require('./gulp/scripts')(gulp, plugins));
gulp.task('scripts-builder', require('./gulp/scripts-builder')(gulp, plugins));
gulp.task('scripts-full', require('./gulp/scripts-full')(gulp, plugins));
gulp.task('scripts-embed', require('./gulp/scripts-embed')(gulp, plugins));
gulp.task('scripts-contrib', require('./gulp/scripts-contrib')(gulp, plugins));

// Copy the version and dependencies into the distribution package.json file.
gulp.task('package-version', function() {
  const pkg = require('./package.json');
  return gulp.src([
    'src/package.json'
  ])
    .pipe(plugins.replace(/"version": ""/, `"version": "${pkg.version}"`))
    .pipe(plugins.replace(/"dependencies": {}/, `"dependencies": ${JSON.stringify(pkg.dependencies)}`))
    .pipe(gulp.dest('lib'));
});

// Add dist files to application.
gulp.task('application-libs', () => {
  return gulp.src(['lib/dist/**/*.*']).pipe(gulp.dest('app/dist'))
});

// Watch for changes.
gulp.task('watch', require('./gulp/watch')(gulp, plugins));

// Create a new build.
gulp.task('build', gulpsync.sync([['clean'], 'babel', 'package-version', [
  'icons',
  'styles',
  'styles-builder',
  'scripts',
  'scripts-embed',
  'scripts-contrib',
  'scripts-full',
  'scripts-builder'
], 'application-libs']));

// Default task. Build and watch.
gulp.task('default', ['babel', 'scripts-full', 'watch']);
