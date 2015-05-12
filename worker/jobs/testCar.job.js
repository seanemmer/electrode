'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	TestCar = mongoose.model('TestCar');


module.exports = function(agenda) {

	agenda.define('dailyTestCarReset', function(job, done){

		TestCar.update({}, {'timeToFullCharge': 240}, { multi: true }, function(err) {
			if (err) {
				console.log('Test car reset error: ' + errorHandler.getErrorMessage(err));
			}
		});

		done();
	});

	agenda.define('testCarCreate', function(job, done){

		var newCar = new TestCar({'timeToFullCharge': 240});

		newCar.save(function(err) {
			if (err) {
				console.log('Test car save error: ' + errorHandler.getErrorMessage(err));
			}
		});

		done();
	});
};
