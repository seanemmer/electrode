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

exports.update = function(req, res) {
	var vehicle = req.vehicle;

	vehicle.schedule = req.body.schedule;

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

/**
 * Vehicle middleware
 */
exports.vehicleById = function(req, res, next, id) {
	Vehicle.findById(id, function(err, vehicle) {
		if (err) return next(err);
		if (!vehicle) return next(new Error('Failed to load article ' + id));
		req.vehicle = vehicle;
		next();
	});
};
