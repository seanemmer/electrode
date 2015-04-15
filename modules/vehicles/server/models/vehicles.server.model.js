'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Vehicle Schema
 */

var VehicleSchema = new Schema({
	utility: {
		type: String,
		trim: true,
		required: true
	},
	date: {
		type: Date,
		required: true,
		unique: true
	},
	forward: {
		type: [Number],
		min: -100,
		max: 100,
	},
	realTime: {
		type: [Number],
		min: -100,
		max: 100
	}
});

mongoose.model('Vehicle', VehicleSchema);
