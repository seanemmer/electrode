'use strict';

angular.module('core')
	.filter('historyTable', function() {
		return function(input, year, month) {
			if(month === 'ALL') {
				return _.filter(input, function(date) {
					return date.year === year;
				});
			} else {
				return _.filter(input, function(date) {
					return date.year === year && date.month === month;
				});
			}
		};
});
