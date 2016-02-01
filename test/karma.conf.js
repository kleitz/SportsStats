module.exports = function(config){
	config.set({

		basePath : '../',

		files : [
			'bower_components/angular/angular.js',
			'bower_components/angular-route/angular-route.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'bower_components/jquery/dist/jquery.js',
			'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
			'bower_components/d3/d3.js',
			'test/unit/**/*.js',

			//test and static data
			{
				pattern: 'data/**/*.json',
				watched: true,
				served: true,
				included: false
			}
		],

		autoWatch : true,

		frameworks: ['jasmine'],

		browsers : ['Chrome', 'Firefox'],

		plugins : [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-jasmine'
		],

		junitReporter : {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}

	});
};