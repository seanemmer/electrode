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
		
		var availableTime = moment('17:00 -06:00', 'HH:mm Z').format(), // time that Chicago real time prices are available (5PM CT)
			dayOfWeek = moment().format('d') - 1, // our convention is offset by 1 from ISO8601
			chargeParams = [],
			vehicle = {
				_id: job.attrs.data.id
			},
			schedule = [],
			teslaData = {};

		// GET vehicle data from db
		Vehicle.findById(vehicle._id).exec()
		.then(function(payload) {
			vehicle = payload;
			schedule = payload.schedule;

			// GET charge_state data from tesla (using dummy here)
			teslaData = {
				charge_state: {
					charging_state: 'plugged_in',
					time_to_full_charge: 180,
					battery_level: 45
				}
			};			
		})
		.then(function(payload) {
			// Check if car is plugged in, if not terminate job
			if(teslaData.charge_state.charging_state === 'unplugged') { 
				done(); 
				return;
			}

			// set today's charge if car is active today && time target is in the future && has less than today's target charge
			var todayBoolean =  schedule[dayOfWeek].active && 
								moment().isBefore(moment(schedule[dayOfWeek].time, 'hh:mmA')) &&
							    teslaData.charge_state.battery_level < schedule[dayOfWeek].target;


			// set tomorrow's charge if car is active tomorrow && has less than tomorrow's target charge && tomorrow's pricing data is available
			var tomorrowBoolean = schedule[dayOfWeek+1].active && 
								  teslaData.charge_state.battery_level < schedule[dayOfWeek + 1].target &&
	  				 			  moment().isAfter(availableTime);


			// Handle vehicles scheduled to charge today
			if(todayBoolean) {
				console.log('today');
				setChargeState();
			// Handle vehicles scheduled to charge tomorrow
			} else if (tomorrowBoolean) {
				console.log('tomorrow');
				setChargeState();

			}

			function setChargeState(priceArray, targetCharge, targetTime) {

			}
			done();
		}, function(error) {
			console.log(error);
			done();
		});
	});

	agenda.define('hourlyChargeQuery', function(job, done){

		var availableTime = moment('17:00 -06:00', 'HH:mm Z').format(), // time that Chicago real time prices are available (5PM CT)
			dayOfWeek = moment().format('d') - 1,  // our convention is offset by 1 from ISO8601
			query = {};

		// pull today's and tomorrow's prices from database

		// fork based on price availability
		if(moment().isAfter(availableTime)) {

			// pull today and tomorrow's pricing from db

			// construct query for vehicles active today and tomorrow
			var queryA = {};
			queryA['schedule.' + dayOfWeek + '.active'] = true;

			var queryB = {};
			queryB['schedule.' + (dayOfWeek + 1) + '.active'] = true;

			query = {
				$or: [queryA, queryB]
			};

		} else {

			// pull today's pricing from db

			// construct query for vehicles active today only
			query['schedule.' + dayOfWeek + '.active'] = true;

		}

		Vehicle.find(query, '_id schedule', function(err, result) {
			if(err) {
				return console.log('Database error (hourly charge query): ' + errorHandler.getErrorMessage(err));
			}
			result.forEach(function(element) {
				agenda.now('hourlyChargeSet', { id: element._id, schedule: element.schedule.toObject() } );
			});
		});

		done();
	});

	agenda.now('hourlyChargeQuery');
	agenda.start();
};
