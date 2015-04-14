'use strict';

var agenda = require('agenda')(),
	mongoose = require('mongoose'),
	jobs = mongoose.connection.collection('jobs');

jobs.ensureIndex({
    nextRunAt: 1, 
    lockedAt: 1, 
    name: 1, 
    priority: 1
}, function() {});

agenda.mongo(jobs);

var jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

jobTypes.forEach(function(type)  {
	require('./jobs/' + type)(agenda);
});

if(jobTypes.length) {
	agenda.start();
}

module.exports = agenda;
