'use strict';

/**
 * Module dependencies.
 */

var moment = require('moment'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Charge = mongoose.model('Charge');


module.exports = function(agenda) {

	// set time that Chicago real time prices are available (5PM CT)
	var availableTime = moment('17:00 -06:00', 'HH:mm Z').format();

	// fork based on price availability
	if(moment().isAfter(availableTime)) {
		// tomorrow's forward prices available, query vehicles active today or tomorrow

	} else {
		// tommorow's forward prices not available, query vehicles active today

	}

};
