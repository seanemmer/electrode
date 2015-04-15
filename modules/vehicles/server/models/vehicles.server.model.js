'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Schedule Schema
 */

 var ScheduleDaySchema = new Schema({
 	day: {
 		type: String,
 		enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
 		required: true
 	},
 	active: {
 		type: Boolean,
 		required: true
 	},
 	time: {
 		type: String,
 		match: /([1-9]|1[0-2]):[0-5][0-9](AM|PM)/,
 		required: true
 	},
 	target: {
 		type: Number,
 		min: 0,
 		max: 100,
 		required: true
 	}
 });

/**
 * Zap Schema
 */

var ZapSchema = new Schema({
	startTime: {
		type: Date
	},
	endTime: {
		type: Date
	},
	startState: {
 		type: Number,
 		min: 0,
 		max: 100
	},
	endState: {
 		type: Number,
 		min: 0,
 		max: 120
	}
});

/**
 * Charge Schema
 */

var ChargeSchema = new Schema({
	date: {
		type: Date,
		required: true
	},

	// A 'charge' consists of multiple continuous 'zaps'
	zaps: [ZapSchema]
});

/**
 * Vehicle Schema
 */

var VehicleSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	manufacturer: {
		type: String,
		required: true
	},
	model: {
		type: String,
		required: true
	},
	latestState: {
 		type: Number,
 		min: 0,
 		max: 120
	},
	pluggedIn: {
		type: Boolean,
		default: false,
		required: true
	},
	charging: {
		type: Boolean,
		default: false,
		required: true
	},

	// schedule generated in planning view (array of scheduleDays)
	schedule: [ScheduleDaySchema],

	// charges stored as they occur
	charges: [ChargeSchema]

});

// Validate that schedule includes each day of week only once
VehicleSchema.path('schedule').validate(function(schedule) {
	// skip validation if no schedule has been made
	if(schedule.length === 0) {
		return true;
	}

	var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	var scheduleDays = _.pluck(schedule, 'day');

	return (scheduleDays.length === 7 && _.difference(weekDays,scheduleDays).length === 0);

}, 'Schedule must include each day of the week');

mongoose.model('Vehicle', VehicleSchema);
