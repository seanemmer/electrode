'use strict';

/**
 * Module dependencies.
 */
var config = require('../../config/config'),
	request = require('request'),
	Q = require('q'),
	querystring = require('querystring'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	Price = mongoose.model('Price');


module.exports = function(agenda) {

	// initialize http fail counter
	var httpFails = 0;

	// Create agenda jobs

	agenda.define('dailyPullComEd', function(job, done){

		// Unified promise to pull forward and real-time pricing data simultaneously
		Q.all([
			getPricing('daynexttoday', '20150414'),
			getPricing('day', '20150414')
		])
		.spread(function(forwardPayload, realTimePayload) {
			// reset http fail counter
			httpFails = 0;

			// Save pricing data to new price document
			var dataDate = new Date();
			dataDate.setHours(0,0,0,0);

			var price = new Price({
				'utility': 'ComEd',
				'date': dataDate,
				'forward': forwardPayload,
				'realTime': realTimePayload
			});

			price.save(function(err) {
				if(err) {
					return console.log('Database error (daily data): ' + errorHandler.getErrorMessage(err));
				}
				console.log('Saved ComEd daily data to ' + config.db + ' at ' + new Date());
			});

		}, function(forwardError, realTimeError) {
			if(forwardError) console.log(forwardError);
			if(realTimeError) console.log(realTimeError);

			// recursively call job if either HTTP request fails (disabled after 4 tries)
			if(httpFails < 4) {
				agenda.now('dailyPullComed');
				httpFails++;
			}
		})
		.then(function() {
			done();
		});
	});

	agenda.define('hourlyPullComEd', function(job, done){
		// Pull real-time pricing data
		getPricing('day', '20150414')
		.then(function(payload) {
			// reset http fail counter
			httpFails = 0;

			// Update pricing data on existing price document
			var dataDate = new Date();
			dataDate.setHours(0,0,0,0);

			Price.findOne({ date: dataDate }, function(err, price) {
				if(err) {
					return console.log('Database error (hourly data): ' + errorHandler.getErrorMessage(err));
				} else if(price === null) {
					return console.log('Database error (hourly data): Daily data document not yet created, please do so before retreiving hourly data');
				}

				price.realTime = payload;

				price.save(function(err) {
					if(err) {
						return console.log('Database error (hourly data): ' + errorHandler.getErrorMessage(err));
					}
					console.log('Saved ComEd hourly data to ' + config.db + ' at ' + new Date());					
				});
			});

		}, function(reason) {
			console.log(reason);

			// recursively call job if HTTP request fails (disabled after 4 tries)
			if(httpFails < 4) {
				agenda.now('hourlyPullComEd');
				httpFails++;
			}
		})
		.then(function() {
			done();
		});
	});

	// function to request and parse data from ComEd
	function getPricing(type, date) {
		// returns a Q promise
		var deferred = Q.defer();

		var output = [];

		var requestQuerystring = querystring.stringify({
			type: type,
			date: date
		});

		var requestURL = 'https://rrtp.comed.com/rrtp/ServletFeed' + '?' + requestQuerystring;

		request(requestURL, function(error, response, body) {
			if (error || response.statusCode !== 200) {	
				deferred.reject(new Error('Unable to retreive data from utility'));

			} else {			
				
				// parse ComEd data
				var payloadArray = response.body.replace(/[\[\]]/g, '').split(', ');
				payloadArray.forEach(function(item, index) {
					if(index %2 !== 0) {
						output.push(parseFloat(item));
					}
				});

				// fill remainder of array with null values if real time
				if(type === 'day') {
					for (var i=0, len = 24 - output.length; i < len; i++) {
						output.push(null);
					}
				}

				deferred.resolve(output);
			} 
		});

		return deferred.promise;
	}
};
