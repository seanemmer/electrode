'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Tesla Schema
 */

var TestCarSchema = new Schema({
	timeToFullCharge: {
		type: Number,
		required: true
	}

});

mongoose.model('TestCar', TestCarSchema);
