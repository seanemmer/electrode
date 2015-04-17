'use strict';

angular.module('users').controller('RegisterDialogCtrl', ['Users', 'Vehicles', '$timeout', '$scope', '$mdDialog','$http', '$location', 'Authentication',
	function(Users, Vehicles, $timeout, $scope, $mdDialog, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		$scope.dialogCancel = function() {
			$mdDialog.cancel();
		};

		$scope.dialogRegister = function() {
			$http.post('/api/auth/register', $scope.credentials)
			.then(function(payload) {

				// If successful we assign the newly registered user to the global user model
				Authentication.user = payload.data;

				// and create a default vehicle
				var newVehicle = new Vehicles({
					'user': Authentication.user.id,
					'manufacturer': 'Tesla',
					'model': 'Model S'
				});

				return newVehicle.$save();

			})
			.then(function(payload) {
				// If successful we add the vehicle to the user's vehicles list in the database
				var tempUser = Authentication.user;
				if(tempUser.vehicles.indexOf(payload._id) === -1) {
					tempUser.vehicles.push(payload._id);
				}

				var user = new Users(tempUser);
				return user.$update();
			})
			.then(function(payload) {
				// If successful we assign the updated user to the global user model
				Authentication.user = payload;

				// Close/resolve the dialog (triggering redirect to /planning)
				$mdDialog.hide();
			})
			.catch(function(error) {
				$scope.error = error.data.message;
			});
		};
	}
]);
