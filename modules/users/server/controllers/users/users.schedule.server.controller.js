'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Save schedule
 */

exports.saveSchedule = function(req, res) {
	// Init Variables
	var user = req.user;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	req.body.schedule.forEach(function(scheduleDay, index) {
		if(JSON.stringify(user.schedule[index]) !== JSON.stringify(scheduleDay)) {
			user.schedule[index] = scheduleDay;
		}
	});

};
