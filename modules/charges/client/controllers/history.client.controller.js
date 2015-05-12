'use strict';

angular.module('charges').controller('HistoryCtrl', ['$mdBottomSheet', '$scope', 'Authentication',
	function($mdBottomSheet, $scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.year = 2015;
		$scope.yearOptions = [2014, 2015, 2016];

		$scope.month = 'December';
		$scope.monthOptions = [
			'ALL',
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		$scope.entries = [
			{
				'month': 'December',
				'day': 29,
				'year': 2015,
				'target': '85',
				'time': 'SAMPLE'
			},
			{
				'month': 'December',
				'day': 30,
				'year': 2015,
				'target': '85',
				'time': 'SAMPLE'
			},
			{
				'month': 'December',
				'day': 31,
				'year': 2015,
				'target': '65',
				'time': 'SAMPLE'
			},
			{
				'month': 'January',
				'day': 1,
				'year': 2016,
				'target': '85',
				'time': 'SAMPLE'
			},
			{
				'month': 'January',
				'day': 2,
				'year': 2016,
				'target': '100',
				'time': 'SAMPLE'
			}
		];

		$scope.entryClick = function() {
			$mdBottomSheet.show({
				templateUrl: 'modules/charges/dialogs/views/history.bottomSheet.client.view.html',
				controller: 'HistoryBottomSheetCtrl'
			});
		};
	}
]);
