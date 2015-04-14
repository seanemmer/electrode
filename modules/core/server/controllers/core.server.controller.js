'use strict';

/**
 * Module dependencies.
 */
var request = require('request'),
	querystring = require('querystring'),
	_ = require('lodash');

/**
 * Render the main applicaion page
 */
exports.renderIndex = function(req, res) {
	res.render('modules/core/server/views/index', {
		user: req.user || null
	});
};

/**
 * Render the server error page
 */
exports.renderServerError = function(req, res) {
	res.status(500).render('modules/core/server/views/500', {
		error: 'Oops! Something went wrong...'
	});
};

/**
 * Render the server not found page
 */
exports.renderNotFound = function(req, res) {
	res.status(404).render('modules/core/server/views/404', {
		url: req.originalUrl
	});
};

/**
 * Route through the CORS proxy
 */
exports.corsProxy = function(req, res) {
	var requestURL = req.query.host + '?' + querystring.stringify(_.omit(req.query,'host'));

	request(requestURL, function(error, response, body) {
		if (!error && response.statusCode === 200) {
		    res.json(response.body);
		}
	});
};
