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

// Validate that pricing arrays include each hour of the day
function hoursValidate(array) {
	return array.length === 24;
}

PriceSchema.path('forward').validate(hoursValidate, 'Forward price array must have a length of 24');
PriceSchema.path('realTime').validate(hoursValidate, 'Real-time price array must have a length of 24');

mongoose.model('Price', PriceSchema);
