'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	Vehicle = mongoose.model('Vehicle');

/**
 * Create a Vehicle
 */
exports.create = function(req, res) {
	var vehicle = new Vehicle(req.body);
	vehicle.user = req.user;

	vehicle.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(vehicle);
		}
	});
};
