'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Charge Schema
 */

var ChargeSchema = new Schema({
	vehicle: {
		type: Schema.ObjectId,
		ref: 'Vehicle',
		index: true,
		required: true
	},
	startTime: {
		type: Date,
		required: true
	},
	startLevel: {
 		type: Number,
 		min: 0,
 		max: 100,
 		required: true
	},
	endTime: {
		type: Date,
		default: null
	},
	endLevel: {
 		type: Number,
 		min: 0,
 		max: 110,
 		default: null
	},
 	scheduleDay: {
 		type: String,
 		enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
 		required: true
 	},
 	scheduleTime: {
 		type: String,
 		match: /([1-9]|1[0-2]):[0-5][0-9](AM|PM)/,
 		required: true
 	},
 	scheduleTarget: {
 		type: Number,
 		min: 0,
 		max: 100,
 		required: true
 	}
});

mongoose.model('Charge', ChargeSchema);
