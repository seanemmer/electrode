'use strict';

process.env.NODE_ENV = 'development';

var mongoose = require('./config/lib/mongoose');

mongoose.connect(function() {
	require('./worker/schedule.js');
});
