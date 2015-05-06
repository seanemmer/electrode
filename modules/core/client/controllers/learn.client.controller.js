'use strict';

angular.module('core').controller('LearnCtrl', ['$mdToast', '$mdDialog', '$state', '$scope', 'Authentication',
	function($mdToast, $mdDialog, $state, $scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		$scope.getStarted = function(event) {
			if(!$scope.authentication.user) {
				$mdDialog.show({
					targetEvent: event,
					templateUrl: 'modules/users/dialogs/views/register.dialog.client.view.html',
					controller: 'RegisterDialogCtrl'
				})
				.then(function() {
					$state.go('planning');
					
					$mdToast.show($mdToast.simple()
						.content('Successfully Registered!')
						.position('bottom right')
					);
				});
			} else {
				$state.go('planning');
			}
		};

		$scope.homeSignIn = function(event) {
			$mdDialog.show({
				targetEvent: event,
				templateUrl: 'modules/users/dialogs/views/sign_in.dialog.client.view.html',
				controller: 'SignInDialogCtrl'
			})
			.then(function() {
				$state.go('planning');

				$mdToast.show($mdToast.simple()
					.content('Successfully Signed In!')
					.position('bottom right')
				);
			});
		};

	}
]);
