'use strict';

angular.module('users').controller('SignInDialogCtrl', ['Authentication', '$http', '$scope', '$location', '$mdDialog',
	function(Authentication, $http, $scope, $location, $mdDialog) {
		$scope.authentication = Authentication;

		$scope.dialogCancel = function() {
			$mdDialog.cancel();
		};

		$scope.dialogSignIn = function() {
			$http.post('/api/auth/signin', $scope.credentials).success(function(response) {
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
