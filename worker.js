'use strict';

var mongoose = require('./config/lib/mongoose');

mongoose.connect(function() {
	require('./worker/jobs.js');
});
