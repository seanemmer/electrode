'use strict';

/**
 * Module dependencies.
 */

module.exports = function(app) {
	// Price Routes
	var prices = require('../controllers/prices.server.controller');

	// Setting up the prices  api
	app.route('/api/prices/comed').get(prices.comEd);
};
