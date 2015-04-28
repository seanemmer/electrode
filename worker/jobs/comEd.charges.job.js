'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment'),
	_ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Q = require('q'),
	mongoose = require('mongoose'),
	Vehicle = mongoose.model('Vehicle'),
	Charge = mongoose.model('Charge'),
	Price = mongoose.model('Price');


module.exports = function(agenda) {

	agenda.define('hourlyChargeSet', function(job, done){
		
		var availableTime = moment('17:00 -06:00', 'HH:mm Z').format(), // time that Chicago real time prices are available (5PM CT)
			dayOfWeek = moment().format('d') - 1, // our convention is offset by 1 from ISO8601
			hourOfDay = parseInt(moment().add(1, 'h').format('H')),
			chargeParams = [],
			vehicle = {
				_id: job.attrs.data.id
			},
			pricesArray = job.attrs.data.prices,
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
				setChargeState(pricesArray, schedule[dayOfWeek].target, schedule[dayOfWeek].time);
			// Handle vehicles scheduled to charge tomorrow
			} else if (tomorrowBoolean) {
				setChargeState(pricesArray, schedule[dayOfWeek + 1].target, schedule[dayOfWeek + 1].time);

			}

			function setChargeState(pricesArray, targetCharge, targetTime) {
				var numArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
					sortArray = [];

				numArray.forEach(function(element, i) { 
					sortArray[i] = {
						hour: element,
						price: pricesArray[0].forward[i]
					};
				});

				sortArray = _.chain(sortArray)
					.filter(function(element){ return element.hour >= hourOfDay; })
					.sortBy(function(element){ return element.price; })
					.value();

				var currentHourRank = _.findIndex(sortArray, function(element) {
					return element.hour === hourOfDay;
				});

					console.log(sortArray);
					console.log(currentHourRank);

				if(teslaData.charge_state.time_to_full_charge > currentHourRank*60) {
					console.log('CHARGE ME UP SCOTTY!!');
				}
			}

			done();
		}, function(err) {
			console.log(err);
			done();
		});
	});

	agenda.define('hourlyChargeQuery', function(job, done){

		var availableTime = moment('17:00 -06:00', 'HH:mm Z').format(), // time that Chicago real time prices are available (5PM CT)
			dayOfWeek = moment().format('d') - 1,  // our convention is offset by 1 from ISO8601
			query = {},
			prices = [];

		// Pull price data from database, query vehicles that are candidates for charging, schedule charge jobs immediately
		
		// fork based on price availability
		if(moment().isAfter(availableTime)) {

			// Construct query for vehicles active today and tomorrow
			var queryA = {};
			queryA['schedule.' + dayOfWeek + '.active'] = true;

			var queryB = {};
			queryB['schedule.' + (dayOfWeek + 1) + '.active'] = true;

			query = {
				$or: [queryA, queryB]
			};

			// Pull today and tomorrow's pricing from db
			var todayLookupDate = new Date();
			todayLookupDate.setHours(0,0,0,0);

			var tomorrowLookupDate = new Date();
			tomorrowLookupDate.setDate(tomorrowLookupDate.getDate() + 1);
			tomorrowLookupDate.setHours(0,0,0,0);

			Q.all([
				pullDbPrices(todayLookupDate),
				pullDbPrices(tomorrowLookupDate)
			])
			.spread(function(todayPayload, tomorrowPayload) {
				prices.push(todayPayload.toObject(), tomorrowPayload.toObject());
				// Then execute vehicle query
				return execVehicleQuery(query);
			}, function(todayError, tomorrowError) {
				var errorMessage;

				// Handle different price retreival error scenarios
				if(todayError && tomorrowError) {
					errorMessage = errorHandler.getErrorMessage(todayError) + ' & ' + errorHandler.getErrorMessage(tomorrowError);
				} else if(todayError) {
					errorMessage = errorHandler.getErrorMessage(todayError);
				} else if(tomorrowError) {
					errorMessage = errorHandler.getErrorMessage(tomorrowError);
				}
				throw new Error(errorMessage);
			})
			// And immediately schedule charge jobs
			.then(function(payload) {
				payload.forEach(function(element) {
					agenda.now('hourlyChargeSet', { id: element._id, schedule: element.schedule.toObject(), prices: prices } );
				});
			})
			.fail(function(err) {
				console.log('Database error (hourly charge): ' + errorHandler.getErrorMessage(err));
			});

		} else {

			// Construct query for vehicles active today only
			query['schedule.' + dayOfWeek + '.active'] = true;

			// Pull today's pricing from db
			var lookupDate = new Date();
			lookupDate.setHours(0,0,0,0);

			pullDbPrices(lookupDate)
			.then(function(payload) {
				prices.push(payload.toObject());
				// Then execute vehicle query
				return execVehicleQuery(query);
			})
			// And immediately schedule charge jobs
			.then(function(payload) {
				payload.forEach(function(element) {
					agenda.now('hourlyChargeSet', { id: element._id, schedule: element.schedule.toObject(), prices: prices } );
				});
			})
			.fail(function(err) {
				console.log('Database error (hourly charge): ' + errorHandler.getErrorMessage(err));
			});

		}

		// function to pull pre-stored price data from MongoDB
		function pullDbPrices(date) {
			// returns a Q promise
			var deferred = Q.defer();

			Price.findOne({ date: date }, function(err, price) {
				if(err) {
					deferred.reject(err);
				} else if(price === null) {
					deferred.reject(new Error('No price data available for ' + new Date()));
				} else {
					deferred.resolve(price);
				}
			});

			return deferred.promise;
		}

		// function to execute vehicle query (pulls vehicles data from MongoDB based on conditions parameter)
		function execVehicleQuery(conditions) {
			// returns a Q promise
			var deferred = Q.defer();

			Vehicle.find(conditions, '_id schedule', function(err, result) {
				if(err) {
					deferred.reject(err);
				} else {
					deferred.resolve(result);
				}
			});		

			return deferred.promise;	
		}

		done();
	});

	agenda.now('hourlyChargeQuery');
	agenda.start();
};
