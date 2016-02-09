var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');

gulp.task('js', function () {
	gulp.src(['app/js/source/**/module.js', 'app/js/source/**/*.js'])
		//.pipe(sourcemaps.init())
		.pipe(concat('app.js'))
		//.pipe(ngAnnotate())
		//.pipe(uglify())
		//.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/js/'))
})

gulp.task('testSetup', function () {
	gulp.src(['app/js/source/**/module.js', 
			'app/js/source/controllers/**/*.js',
			'app/js/source/directives/**/*.js',
			'app/js/source/filters/**/*.js',
			'app/js/source/services/**/*.js'])
		//.pipe(sourcemaps.init())
		.pipe(concat('testApp.js'))
		//.pipe(ngAnnotate())
		//.pipe(uglify())
		//.pipe(sourcemaps.write())
		.pipe(gulp.dest('test/unit/'));
})

gulp.task('sass', function () {
	gulp.src(['app/css/sass/**/*.scss'])
		.pipe(concat('main2.js'))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('app/css/'))
})

gulp.task('watch', ['js','testSetup', 'sass'], function () {
	gulp.watch('app/js/source/**/*.js', ['js','testSetup'])
	gulp.watch('app/css/sass/*.scss', ['sass'])
})

gulp.task('all', ['js','testSetup', 'sass']);