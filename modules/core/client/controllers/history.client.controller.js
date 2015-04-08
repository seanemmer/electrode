'use strict';

angular.module('core').controller('HistoryCtrl', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.entries = [
			{
				'date': 'December 29, 2015',
				'target': '85',
				'time': '8:00AM'
			},
			{
				'date': 'December 30, 2015',
				'target': '85',
				'time': '8:00AM'
			},
			{
				'date': 'December 31, 2015',
				'target': '65',
				'time': '1:30PM'
			},
			{
				'date': 'January 1, 2016',
				'target': '85',
				'time': '9:00AM'
			},
			{
				'date': 'January 2, 2016',
				'target': '100',
				'time': '8:00AM'
			}
		];
	}
]);
