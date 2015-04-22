'use strict';

/**
 * Module dependencies.
 */
var chargesPolicy = require('../policies/charges.server.policy'),
	charges = require('../controllers/charges.server.controller');

module.exports = function(app) {

	// Finish by binding the vehicle middleware
	app.param('chargeId', charges.chargeById);
};
