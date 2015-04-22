'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	Charge = mongoose.model('Charge');

/**
 * Charge middleware
 */
exports.chargeById = function(req, res, next, id) {
	Charge.findById(id, function(err, charge) {
		if (err) return next(err);
		if (!charge) return next(new Error('Failed to load article ' + id));
		req.charge = charge;
		next();
	});
};
