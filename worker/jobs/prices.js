'use strict';

/**
 * Module dependencies.
 */
var config = require('../../config/config'),
	request = require('request'),
	Q = require('q'),
	querystring = require('querystring'),
	_ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	Price = mongoose.model('Price');


module.exports = function(agenda) {

	// Create agenda jobs

	agenda.purge(function(err, numRemoved) {});

	agenda.define('dailyPullComEd', function(job, done){

		// Unified promise to pull forward and real-time pricing data simultaneously
		Q.all([
			getPricing('daynexttoday', '20150414'),
			getPricing('day', '20150414')
		])
		.spread(function(forwardPayload, realTimePayload) {

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
					console.log('Database error (daily data): ' + errorHandler.getErrorMessage(err));
				}
				console.log('Saved ComEd daily data to ' + config.db + ' at ' + new Date());
			});

			done();

		}, function(forwardError, realTimeError) {
			console.log(forwardError);
			console.log(realTimeError);
		})
		.then(function() {
			done();
		});
	});

	agenda.define('hourlyPullComEd', function(job, done){
		// Pull real-time pricing data
		getPricing('day', '20150414')
		.then(function(payload) {

			// Update pricing data on existing price document
			var dataDate = new Date();
			dataDate.setHours(0,0,0,0);

			Price.update({ date: dataDate }, { realTime: payload }, function (err) {
				if(err) {
					console.log('Database error (hourly data): ' + errorHandler.getErrorMessage(err));
				}
				console.log('Saved ComEd hourly data to ' + config.db + ' at ' + new Date());
			});

		}, function(reason) {
			console.log(reason);
		})
		.then(function() {
			done();
		});
	});

	// Schedule jobs

	//var dailyPullComEd = agenda.create('dailyPullComEd').schedule('3:10pm').repeatEvery('5 minutes').save();

	var hourlyPullComEd = agenda.create('hourlyPullComEd').schedule('3:10pm').repeatEvery('1 hour').save();	

	// function to request and Parse data from ComEd
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
