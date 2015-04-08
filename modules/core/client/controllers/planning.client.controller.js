'use strict';

angular.module('core').controller('PlanningCtrl', ['$mdToast', 'Users', 'Authentication', '$timeout', '$scope', '$mdDialog',
	function($mdToast, Users, Authentication, $timeout, $scope, $mdDialog) {
		$scope.authentication = Authentication;

		var initialSchedule = $scope.authentication.user.schedule;

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

				// initialSchedule variable for dirty checking
				initialSchedule = angular.copy($scope.chargeSettings);		
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

		// Set watch function for dirty checking schedule
		$timeout(function() {
			$scope.$watch('chargeSettings', function(newVal, oldVal) {
				$scope.scheduleDirty = !equalSchedules(initialSchedule, newVal);
			}, true);
		}, 0);

		function equalSchedules(initial, current) {
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
				templateUrl: 'modules/core/dialogs/views/planning.dialog.client.view.html',
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
			$scope.authentication.user.schedule = $scope.chargeSettings;
			var user = new Users($scope.authentication.user);

			user.$update(function(response) {
				$mdToast.show($mdToast.simple()
					.content('Updated Schedule Saved!')
					.position('bottom right')
				);

				// Update global user object
				$scope.authentication.user = response;
				
				// Update initial schedule variable and remove 'save' button
				initialSchedule = response.schedule;
				$scope.scheduleDirty = false;
				
			}, function(response) {
				$mdToast.show($mdToast.simple()
					.content(response.data.message)
					.position('bottom right')
				);
			});
		};

	}
]);
