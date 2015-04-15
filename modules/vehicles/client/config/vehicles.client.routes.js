'use strict';

// Setting up route
angular.module('core').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('planning', {
				url: '/planning',
				templateUrl: 'modules/vehicles/views/planning.client.view.html',
				controller: 'PlanningCtrl'
			});
	}
]);
