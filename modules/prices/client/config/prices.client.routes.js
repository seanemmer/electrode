'use strict';

// Setting up route
angular.module('prices').config(['$stateProvider',
	function ($stateProvider) {
		// Users state routing
		$stateProvider
			.state('prices', {
				url: '/electricity-pricing',
				templateUrl: 'modules/prices/views/prices.client.view.html',
				controller: 'PricesCtrl'
			});
	}
]);
