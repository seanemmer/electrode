'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment-timezone'),
	_ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Q = require('q'),
	mongoose = require('mongoose'),
	Vehicle = mongoose.model('Vehicle'),
	Charge = mongoose.model('Charge'),
	Price = mongoose.model('Price');


module.exports = function(agenda) {

	var timeZone = 'America/Chicago';

	agenda.define('hourlyChargeSet', function(job, done){

		var availableTime = moment.tz(timeZone).startOf('day').hour(17), // time that Chicago real time prices are available (5PM CT)
			dayOfWeek = moment.tz(timeZone).format('d') - 1, // our convention is offset by 1 from ISO8601
			hourOfDay = parseInt(moment.tz(timeZone).add(1, 'h').format('H')),
			chargeParams = [],
			vehicle = {
				_id: job.attrs.data.vehicleId
			},
			priceMatrix = job.attrs.data.prices,
			schedule = [],
			teslaData = {},
			vehicleTimeStamp;

		// GET vehicle data from db
		Vehicle.findById(vehicle._id).exec()
		.then(function(payload) {
			vehicle = payload;
			schedule = payload.schedule;

			// GET charge_state data from tesla (using dummy here)
			teslaData = {
				charge_state: {
					charging_state: 'plugged_in', //unplugged
					time_to_full_charge: 181,
					battery_level: 45
				}
			};			
		})
		.then(function() {
			vehicleTimeStamp = '	[Vehicle: ' + vehicle._id + ', Date: ' + new Date() + ']';
			// Check if car is plugged in, if not return (terminates job)
			if(teslaData.charge_state.charging_state === 'unplugged') {
				// terminate charge if currentCharge exists for vehicle
				if(vehicle.currentCharge) {
					terminateDbCharge(vehicle, teslaData.charge_state.battery_level);
				}
				console.log('Vehicle unplugged, terminating job');
				return;
			}			

			// set today's charge if car is active today && time target is in the future && has less than today's target charge
			var tempMoment = moment.utc(schedule[dayOfWeek].time, 'h:mm A');
			var scheduledMoment = moment.tz('America/Los_Angeles').set({hours: tempMoment.hours(), minutes: tempMoment.minutes(), seconds: tempMoment.seconds()});

			var todayBoolean =  schedule[dayOfWeek].active && 
								moment.tz(timeZone).isBefore(scheduledMoment) &&
							    teslaData.charge_state.battery_level < schedule[dayOfWeek].target;


			// set tomorrow's charge if car is active tomorrow && has less than tomorrow's target charge && tomorrow's pricing data is available
			var tomorrowBoolean = schedule[dayOfWeek+1].active && 
								  teslaData.charge_state.battery_level < schedule[dayOfWeek + 1].target &&
	  				 			 moment.tz(timeZone).isAfter(availableTime);

			// Handle vehicles scheduled to charge today
			if(todayBoolean) {
				console.log('Scheduled to charge to ' + schedule[dayOfWeek].target + '% by ' + schedule[dayOfWeek].time + ' today' + vehicleTimeStamp);
				setChargeState(priceMatrix, vehicle, teslaData.charge_state.battery_level, teslaData.charge_state.time_to_full_charge, false);
			// Handle vehicles scheduled to charge tomorrow
			} else if (tomorrowBoolean) {
				console.log('Scheduled to charge to ' + schedule[dayOfWeek + 1].target + '% by ' + schedule[dayOfWeek + 1].time + ' tomorrow' + vehicleTimeStamp);
				setChargeState(priceMatrix, vehicle, teslaData.charge_state.battery_level, teslaData.charge_state.time_to_full_charge, true);
			} else {
				console.log('Not scheduled to charge today/tomorrow or pricing unavailable' + vehicleTimeStamp);
			}

			// function to set vehicle charge state, requires:
			// 1) Prices matrix containing today and tomorrow's forward prices
			// 2) Vehicle object from MongoDB
			// 3) Vehicle's current battery level
			// 4) Vehicle's current time to full charge
			// 5) 'dayAhead' boolean to indicate whether the completion time is after 12am today
			function setChargeState(priceMatrix, vehicle, currentLevel, timeToFull, dayAhead) {
				var numArray = [],
					priceSortArray = [],
					priceCount,
					targetLevel,
					targetHour;

				// initialize variables on basis of dayAhead boolean
				if(dayAhead) {
					priceCount = 48;
					targetLevel = parseInt(vehicle.schedule[dayOfWeek + 1].target);
					targetHour = parseInt(moment.tz(vehicle.schedule[dayOfWeek + 1].time, 'hh:mmA', timeZone).format('H')) + 24;
				} else {
					priceCount = 24;
					targetLevel = parseInt(vehicle.schedule[dayOfWeek].target);
					targetHour = parseInt(moment.tz(vehicle.schedule[dayOfWeek].time, 'hh:mmA', timeZone).format('H'));
				}

				var timeToTargetLevel = timeToFull * targetLevel / 100;

				// Construct priceSortArray from price matrix, adjusting for fact that ComEd forward prices reflect previous hour
				// whereas our algorithm is on the basis of the subsequent hour 
				for(var i=0; i<priceCount; i++) {
					var element;

					//  today's prices
					if(i<24) {
						// for last hour of today, use either first hour of tomorrow or first hour of today (depending on availability)
						if(i === 23) {
							var lastHourPrice = dayAhead ? priceMatrix[1].forward[0] : priceMatrix[0].forward[0];
							element = {
								hour: i,
								price: lastHourPrice
							};
						} else {
							element = {
								hour: i,
								price: priceMatrix[0].forward[i+1]
							};
						}
					// tomorrow's prices
					} else {
						// for last hour of tomorrow, use first hour of tomorrow
						if(i === 47) {
							element = {
								hour: i,
								price: priceMatrix[1].forward[0]
							};
						} else {
							element = {
								hour: i,
								price: priceMatrix[1].forward[i-24+1]
							};
						}
					}
					
					priceSortArray.push(element);
				}

				// Transform priceSortArray: Filter out dates in the past and dates after the completion target, then sort by price DESC
				priceSortArray = _.chain(priceSortArray)
					.filter(function(element){ return element.hour < targetHour && element.hour >= hourOfDay; })  
					.sortBy(function(element){ return element.price; })
					.value();

				// Determine current hour's ranking in transformed priceSortArray
				var currentHourRank = _.findIndex(priceSortArray, function(element) {
					return element.hour < targetHour && element.hour === hourOfDay;
				});

				if(timeToTargetLevel > currentHourRank*60) {
					if(vehicle.currentCharge === null) {
						initializeDbCharge(vehicle, currentLevel, dayAhead);
					} else {
									// log vehicle and date
						console.log('Charge continued' + vehicleTimeStamp);
					}
				} else {
					terminateDbCharge(vehicle, currentLevel);
				}				
			}
		})
		.then(null, function(err) {
			// error handler for entire promise chain (mpromise convention)
			console.log('Process error (hourly charge): ' + errorHandler.getErrorMessage(err));
		})
		.then(function() {
			done();
		});

		// function to initialize new charge in MongoDB, requires:
		// 1) Vehicle object from MongoDB
		// 2) Current vehicle battery level
		// 3) 'dayAhead' boolean to indicate whether the completion time is after 12am today
		function initializeDbCharge(vehicle, currentLevel, dayAhead) {
			var charge = new Charge ({
				vehicle: vehicle._id,
				startTime: new Date(),
				startLevel: currentLevel,
				scheduleDay: vehicle.schedule[dayOfWeek + 1*dayAhead].day,
				scheduleTime: vehicle.schedule[dayOfWeek + 1*dayAhead].time,
				scheduleTarget: vehicle.schedule[dayOfWeek + 1*dayAhead].target,
			});

			charge.save(function(err) {
				if(err) {
					throw err;
				}

				vehicle.currentCharge = charge._id;
				vehicle.save(function(err) {
					if(err) {
						throw err;
					}
					console.log('Charge initialized' + vehicleTimeStamp);
				});
			});
		}

		// function to terminate most recent charge in MongoDB
		// 1) Vehicle object from MongoDB
		function terminateDbCharge(vehicle, currentLevel) {
			Charge.findOne({ vehicle: vehicle._id, endTime: null, endLevel: null }, function(err, charge) {
				if(err) {
					throw err;
				} else if(charge) {
					charge.endTime = new Date();
					charge.endLevel = currentLevel;

					charge.save(function(err) {
						if(err) {
							throw err;
						}
						vehicle.currentCharge = null;
						vehicle.save(function(err) {
							if(err) {
								throw err;
							}
							console.log('Charge terminated' + vehicleTimeStamp);
						});						
					});
				} else {
					console.log('Charge left uninitialized' + vehicleTimeStamp);
				}
			});
		}
	});

	agenda.define('hourlyChargeQuery', function(job, done){

		var availableTime = moment.tz(timeZone).startOf('day').hour(17), // time that Chicago real time prices are available (5PM CT)
			dayOfWeek = moment.tz(timeZone).format('d') - 1,  // app convention is offset by 1 from ISO8601
			query = {},
			prices = [];

		// Pull price data from database, query vehicles that are candidates for charging, schedule charge jobs immediately
		
		// fork based on price availability
		if(moment.tz(timeZone).isAfter(availableTime)) {

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
				if(todayError) {
					errorMessage = errorHandler.getErrorMessage(todayError);
				} else if(tomorrowError) {
					errorMessage = errorHandler.getErrorMessage(tomorrowError);
				}
				throw new Error(errorMessage);
			})
			// And immediately schedule charge jobs
			.then(function(payload) {
				payload.forEach(function(element) {
					agenda.now('hourlyChargeSet', { vehicleId: element._id, schedule: element.schedule.toObject(), prices: prices } );
				});
			})
			.fail(function(err) {
				console.log('Database error (hourly charge query): ' + errorHandler.getErrorMessage(err));
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
					agenda.now('hourlyChargeSet', { vehicleId: element._id, schedule: element.schedule.toObject(), prices: prices } );
				});
			})
			.fail(function(err) {
				console.log('Database error (hourly charge query): ' + errorHandler.getErrorMessage(err));
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
					deferred.reject(new Error('No price data available for ' + date));
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
};
