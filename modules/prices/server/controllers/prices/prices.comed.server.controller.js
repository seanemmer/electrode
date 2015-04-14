'use strict';

/**
 * Module dependencies.
 */
var request = require('request'),
	querystring = require('querystring'),
	_ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	mongoose = require('mongoose'),
	Price = mongoose.model('Price');

exports.comEd = function() {

	console.log('foobar');
};
