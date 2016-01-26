var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var sourcemaps = require('gulp-sourcemaps')

gulp.task('js', function () {
	gulp.src(['app/js/source/**/module.js', 'app/js/source/**/*.js'])
		//.pipe(sourcemaps.init())
		.pipe(concat('app.js'))
		//.pipe(ngAnnotate())
		//.pipe(uglify())
		//.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/js/'))
})

gulp.task('watch', ['js'], function () {
	gulp.watch('app/js/source/**/*.js', ['js'])
})