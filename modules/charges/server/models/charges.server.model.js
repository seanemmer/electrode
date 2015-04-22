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
		require: true
	},
	endTime: {
		type: Date
	},
	startState: {
 		type: Number,
 		min: 0,
 		max: 100,
 		required: true
	},
	endState: {
 		type: Number,
 		min: 0,
 		max: 110
	}
});

mongoose.model('Charge', ChargeSchema);
