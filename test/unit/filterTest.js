'use strict';

/* jasmine specs for controllers go here */
describe('filter', function() {

	var _ssTitleFilter;

	beforeEach(function(){
		module('ssFilters');
	});
	beforeEach(inject(function(pageTitleFilter) {
		_ssTitleFilter = pageTitleFilter;
	}));


	describe('ssTitleFilter', function() {

		it('should display the title plus a broken bar if the entry is not empty', function() {
				expect(_ssTitleFilter('asdf')).toBe('asdf | Act Opener');
				expect(_ssTitleFilter('')).toBe('Act Opener');
			}
		);
	});

});
