'use strict';

/**
 * Module dependencies.
 */
var vehiclesPolicy = require('../policies/vehicles.server.policy'),
	vehicles = require('../controllers/vehicles.server.controller');

module.exports = function(app) {
	// Articles collection routes
	app.route('/api/vehicles').all(vehiclesPolicy.isAllowed)
		.post(vehicles.create);
};
