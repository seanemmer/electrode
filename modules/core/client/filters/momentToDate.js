'use strict';

angular.module('core')
	.filter('momentToDate', function() {
		return function(input) {
			return input.format('MMM DD, YYYY');
		};
});
