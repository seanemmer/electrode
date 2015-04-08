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

				// and close/resolve the dialog (triggering redirect to /planning)
				$mdDialog.hide();
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
