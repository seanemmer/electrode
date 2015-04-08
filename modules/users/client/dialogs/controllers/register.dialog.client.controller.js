'use strict';

angular.module('users').controller('RegisterDialogCtrl', ['$timeout', '$scope', '$mdDialog','$http', '$location', 'Authentication',
	function($timeout, $scope, $mdDialog, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		$scope.dialogCancel = function() {
			$mdDialog.cancel();
		};

		$scope.dialogRegister = function() {
			$http.post('/api/auth/register', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// Close dialog
				$mdDialog.hide();

				// And redirect to the planning page
				$location.path('/planning');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
