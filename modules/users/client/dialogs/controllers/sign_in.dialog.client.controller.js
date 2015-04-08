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

				console.log(response);
				
				// Close dialog
				$mdDialog.hide();

				// And redirect to the index page
				$location.path('/planning');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

	}
]);
