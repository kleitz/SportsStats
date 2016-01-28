'use strict';

/* jasmine specs for controllers go here */
describe('printedTime', function() {

	var _printedTimeFilter;

	beforeEach(function(){
		module('ssFilters');
	});
	beforeEach(inject(function(printedTimeFilter) {
		_printedTimeFilter = printedTimeFilter;
	}));


	//Regular College Data
	var scopeData = {
		game: {
			boxScore: [
				{l:"1st"},
				{l:"2nd"}
			],
			totTime:2400,
			aScore:1,
			hScore:0
		},
		sport: {
			q: {
				n: 2,
				t: 1200,
				o: 300
			}
		}
	};

	//College Overtime Data
	var scopeDataOT = {
		game: {
			boxScore: [
				{l:"1st"},
				{l:"2nd"},
				{l:"OT1"}
			],
			totTime:2700,
			aScore:1,
			hScore:0
		},
		sport: {
			q: {
				n: 2,
				t: 1200,
				o: 300
			}
		}
	};

	//Regular NBA Data
	var scopeDataNBA = {
		game: {
			boxScore: [
				{l:"1st"},
				{l:"2nd"},
				{l:"3rd"},
				{l:"4th"}
			],
			totTime:2880,
			aScore:1,
			hScore:0
		},
		sport: {
			q: {
				n: 4,
				t: 720,
				o: 360
			}
		}
	};


	describe('ssTitleFilter', function() {

		it('should display the game time in a human readable format', function() {
				expect(_printedTimeFilter(0,null)).toBe('0:00');

				//Test College Game
				expect(_printedTimeFilter(0,scopeData)).toBe('Final');
				expect(_printedTimeFilter(2100,scopeData)).toBe('15:00 1st');
				expect(_printedTimeFilter(900,scopeData)).toBe('15:00 2nd');
				expect(_printedTimeFilter(1200,scopeData)).toBe('Half');
				expect(_printedTimeFilter(2400,scopeData)).toBe('20:00 1st');

				//Test College OT Game
				expect(_printedTimeFilter(0,scopeDataOT)).toBe('Final OT1');
				expect(_printedTimeFilter(2400,scopeDataOT)).toBe('15:00 1st');
				expect(_printedTimeFilter(1200,scopeDataOT)).toBe('15:00 2nd');
				expect(_printedTimeFilter(300,scopeDataOT)).toBe('End 2nd');
				expect(_printedTimeFilter(1500,scopeDataOT)).toBe('Half');
				expect(_printedTimeFilter(2700,scopeDataOT)).toBe('20:00 1st');

				//Test NBA Game
				expect(_printedTimeFilter(0,scopeDataNBA)).toBe('Final');
				expect(_printedTimeFilter(2580,scopeDataNBA)).toBe('7:00 1st');
				expect(_printedTimeFilter(1863,scopeDataNBA)).toBe('7:03 2nd');
				expect(_printedTimeFilter(1440,scopeDataNBA)).toBe('Half');
				expect(_printedTimeFilter(2880,scopeDataNBA)).toBe('12:00 1st');
			}
		);
	});

});
