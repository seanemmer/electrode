'use strict';

angular.module('core')
	.filter('minutesToTime', function() {
		return function(input) {
			return input / 2;
		};
});
