'use strict';

angular.module('charges').controller('HistoryBottomSheetCtrl', ['$mdBottomSheet', '$scope', 'Authentication',
	function($mdBottomSheet, $scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

	}
]);
