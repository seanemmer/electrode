'use strict';

angular.module('vehicles').controller('PlanningCtrl', ['$window', '$mdToast', 'Vehicles', 'Users', 'Authentication', '$timeout', '$scope', '$mdDialog',
	function($window, $mdToast, Vehicles, Users, Authentication, $timeout, $scope, $mdDialog) {
		$scope.authentication = Authentication;
		$scope.currentVehicle = Authentication.user.vehicles[0];

		// Expose mobile device boolean and set label text
		if($window.innerWidth <=600) {
			$scope.mobileDevice = true;
			$scope.deviceInput = 'tap';
		} else {
			$scope.mobileDevice = false;
			$scope.deviceInput = 'click';
		}

		var initialSchedule = angular.copy($scope.currentVehicle.schedule);
		$scope.saveButtonText = initialSchedule.length === 0 ? 'Establish Schedule!' : 'Save Changes';

		// initialize chargeSettings array 
		$scope.chargeSettings = [
			{
				'day': 'Monday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			},
			{
				'day': 'Tuesday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			},
			{
				'day': 'Wednesday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			},
			{
				'day': 'Thursday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			},
			{
				'day': 'Friday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			},
			{
				'day': 'Saturday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			},
			{
				'day': 'Sunday',
				'active': false,
				'time': '8:00AM',
				'target': 38
			}
		];

		// assign defaults if no schedule present on User Object
		if(initialSchedule.length === 0) {
			$timeout(function() {
				// scope variable
				$scope.chargeSettings.forEach(function(setting) {
					setting.active = true;
					setting.target = 85;
				});
			}, 0);	
		} else {
			// else assign schedule from User Object to scope (assigned to initialSchedule above)
			$timeout(function() {
				$scope.chargeSettings.forEach(function(setting, index) {
					setting.active = initialSchedule[index].active;
					setting.target = initialSchedule[index].target;
					setting.time = initialSchedule[index].time;
				});
			}, 0);
		}

		// Set watch function for dirty-checking schedule
		$timeout(function() {
			$scope.$watch('chargeSettings', function(newVal, oldVal) {
				$scope.scheduleDirty = !equalSchedules(initialSchedule, newVal);
			}, true);
		}, 0);

		function equalSchedules(initial, current) {
			if (initial.length !== 7) { return false; }

			var equality = true;
			initial.forEach(function(scheduleDay, index) {
				if (scheduleDay.active !== current[index].active ||
						scheduleDay.time !== current[index].time ||
						scheduleDay.target !== current[index].target) {
					equality = false;
				}
			});
			return equality;
		}

		$scope.chargeCircleClick = function(index, event) {
			$mdDialog.show({
				templateUrl: 'modules/vehicles/dialogs/views/planning.dialog.client.view.html',
				targetEvent: event,
				controller: 'PlanningDialogCtrl',
				clickOutsideToClose: false,
				locals: {
					currentData: $scope.chargeSettings[index]
				}
			})
			.then(function(data) {
				$scope.chargeSettings[index].time = data.time;
				$scope.chargeSettings[index].target = data.target;
			});
		};

		// HTTP Update Request
		$scope.updateSchedule = function() {
			var tempVehicle = $scope.currentVehicle;
			tempVehicle.schedule = $scope.chargeSettings;
			
			var vehicle = new Vehicles(tempVehicle);

			vehicle.$update(function(payload) {
				$mdToast.show($mdToast.simple()
					.content('Updated Schedule Saved!')
					.position('bottom right')
				);

				// Update global user object
				$scope.currentVehicle = payload;
				
				// If first time establishing schedule, change save button text
				if(initialSchedule.length === 0) {
					$scope.saveButtonText = 'Save Changes';
				}

				// Update initial schedule variable and remove 'save' button
				initialSchedule = payload.schedule;
				$scope.scheduleDirty = false;
				
			}, function(error) {
				$mdToast.show($mdToast.simple()
					.content('Unable to save: ' + (error.data.message || 'Database error'))
					.position('bottom right')
				);
			});
		};

	}
]);
