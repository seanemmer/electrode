'use strict';

angular.module('core').controller('HomeCtrl', ['$mdDialog', '$state', '$scope', 'Authentication',
	function($mdDialog, $state, $scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.homeRegister = function($event) {
			if(!$scope.authentication.user) {
				$mdDialog.show({
					targetEvent: event,
					templateUrl: 'modules/users/dialogs/views/register.dialog.client.view.html',
					controller: 'RegisterDialogCtrl'
				});
			} else {
				$state.go('planning');
			}
		};

		$scope.homeSignIn = function($event) {
			if(!$scope.authentication.user) {
				$mdDialog.show({
					targetEvent: event,
					templateUrl: 'modules/users/dialogs/views/sign_in.dialog.client.view.html',
					controller: 'SignInDialogCtrl'
				});
			} else {
				$state.go('planning');
			}
		};
	}
]);
