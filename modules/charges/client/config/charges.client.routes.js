'use strict';

// Setting up route
angular.module('core').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('history', {
				url: '/history',
				templateUrl: 'modules/charges/views/history.client.view.html',
				controller: 'HistoryCtrl'
			});
	}
]);
