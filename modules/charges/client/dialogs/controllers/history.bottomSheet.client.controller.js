'use strict';

angular.module('charges').controller('HistoryBottomSheetCtrl', ['$mdBottomSheet', '$scope', 'Authentication',
	function($mdBottomSheet, $scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.closeHistory = function() {
			$mdBottomSheet.hide();
		};

		$scope.timeSeriesLabels = ['12am', '', '2am', '', '4am', '', '6am', '', '8am', '', '10am', '', '12pm', '', '2pm', '', '4pm', '', '6pm', '', '8pm', '', '10pm', ''];
		$scope.timeSeriesSeries = ['Day-Ahead Hourly Price', 'Real-Time Hourly Price', 'Charge Periods'];
		$scope.timeSeriesData = [
			[1.9, 1.9, 1.7, 1.8, 1.7, 1.9, 2.3, 2.7, 3.3, 3.6, 4.3, 4.7, 4.2, 4.6, 5.6, 7.5, 6.9, 4.5, 3.8, 3.2, 4.7, 4.2, 3, 2.4],
			[2.3, 2.2, 1.1, 1.7, 1.6, 2.2, 2.6, 2.9, 5.9, 2.8, 4.4, 4.7, 6.1, 6, 4.9, 0.4, 2.1, 1.4, 2.1, 3, 3.1, 3, 2.3, 2],
			[]
		];

		$scope.costComparisonLabels = [2015];
		$scope.costComparisonSeries = ['Naive', 'Electrode'];
		$scope.costComparisonData = [[4.03], [3.00]];

		$scope.histogramLabels = ['0','1','2','3','4','5','6','7','8','9','10+'];
		$scope.histogramSeries = ['Naive', 'Electrode'];
		$scope.histogramData = [
			[0,0,1,2,2,1,0,0,0,0],
			[3,1,2,0,0,0,0,0,0,0]
		];
	}
]);
