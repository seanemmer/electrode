'use strict';

angular.module('users').controller('RegisterDialogCtrl', ['$q', 'Vehicles', '$timeout', '$scope', '$mdDialog','$http', '$location', 'Authentication',
	function($q, Vehicles, $timeout, $scope, $mdDialog, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		$scope.dialogCancel = function() {
			$mdDialog.cancel();
		};

		$scope.dialogRegister = function() {
			$http.post('/api/auth/register', $scope.credentials)
			.then(function(payload) {

				// If successful we assign the response to the global user model
				$scope.authentication.user = payload.data;

				// and create a default vehicle
				var newVehicle = new Vehicles({
					'user': $scope.authentication.user.id,
					'manufacturer': 'Tesla',
					'model': 'Model S'
				});

				return newVehicle.$save();

			}, function(response) {
				return $q.reject(response);
			})
			.then(function(payload) {

				// Close/resolve the dialog (triggering redirect to /planning)
				$mdDialog.hide();

			}, function(response) {
				$scope.error = response.data.message;
			});
		};
	}
]);
