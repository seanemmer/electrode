'use strict';

// Vehicles service used for communicating with the users REST endpoint
angular.module('vehicles').factory('Vehicles', ['$resource',
	function($resource) {
		return $resource('api/vehicles/:vehicleId', {
			vehicleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
