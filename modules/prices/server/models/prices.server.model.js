'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


// specify utility options
var utilities = ['ComEd'];

/**
 * Price Schema
 */

var PriceSchema = new Schema({
	utility: {
		type: String,
		trim: true,
		enum: utilities,
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

mongoose.model('Price', PriceSchema);
