'use strict';

var agenda = require('agenda')(),
	mongoose = require('mongoose'),
	jobs = mongoose.connection.collection('jobs');

// Connect to job queue

jobs.ensureIndex({
    nextRunAt: 1, 
    lockedAt: 1, 
    name: 1, 
    priority: 1
}, function() {});

agenda.mongo(jobs);

// Execute jobs

var jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

jobTypes.forEach(function(type)  {
	require('./jobs/' + type + '.job')(agenda);
});

//agenda.now('dailyPullComEd');
//agenda.now('hourlyChargeQuery');

if(jobTypes.length) {
	agenda.start();
}

module.exports = agenda;
