'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	Vehicle = mongoose.model('Vehicle'),
	Charge = mongoose.model('Charge');


module.exports = function(agenda) {

	agenda.define('hourlyChargeSet', function(job, done){
		console.log(job.attrs.data);
		done();
	});

	agenda.define('hourlyChargeQuery', function(job, done){

		// set time that Chicago real time prices are available (5PM CT)
		var availableTime = moment('17:00 -06:00', 'HH:mm Z').format();

		var dayOfWeek = moment().format('d') - 1;
		var query = {};

		// fork based on price availability
		if(moment().isAfter(availableTime)) {

			var queryA = {};
			queryA['schedule.' + dayOfWeek + '.active'] = true;

			var queryB = {};
			queryB['schedule.' + (dayOfWeek + 1) + '.active'] = true;

			query = {
				$or: [queryA, queryB]
			};

		} else {

			// tommorow's forward prices not available, query vehicles active today
			query['schedule.' + dayOfWeek + '.active'] = true;

		}

		Vehicle.find(query,function(err, result) {
			if(err) {
				return console.log('Database error (hourly charge query): ' + errorHandler.getErrorMessage(err));
			}

			result.forEach(function(element) {
				agenda.now('hourlyChargeSet', {'vehicleID': element._id } );
			});

		});

		done();
	});

	agenda.now('hourlyChargeQuery');
	agenda.start();
};
