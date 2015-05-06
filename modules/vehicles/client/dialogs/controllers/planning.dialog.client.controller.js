'use strict';

angular.module('vehicles').controller('PlanningDialogCtrl', ['$window', 'currentData', '$scope', '$mdDialog',
	function($window, currentData, $scope, $mdDialog) {

		if($window.innerWidth <=600) {
			$scope.mobileDevice = true;
			$scope.targetOpts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
		} else {
			$scope.mobileDevice = false;
		}

		$scope.day = currentData.day;

		var time = currentData.time;
		var timeLength = time.length;

		$scope.hours = timeLength === 7 ? time.substring(0,2) : '0' + time.substring(0,1);
		$scope.hourOpts = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

		$scope.minutes = time.substring(timeLength-4, timeLength-2);
		$scope.minuteOpts = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

		$scope.meridian = time.substring(timeLength-2, timeLength);
		$scope.meridianOpts = ['AM', 'PM'];

		$scope.target  = currentData.target;
		
		$scope.dialogCancel = function() {
			$mdDialog.cancel();
		};

		$scope.dialogConfirm = function() {

			var data = {
				'time': ($scope.hours.substring(0,1) === '0' ? $scope.hours.substring(1,2) : $scope.hours) + ':' + $scope.minutes + $scope.meridian,
				'target': $scope.target
			};

			$mdDialog.hide(data);
		};
	}
]);
