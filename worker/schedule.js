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

// Set schedule

agenda.purge(function(err, numRemoved) {});

agenda.create('dailyPullComEd').schedule('5:54pm').repeatEvery('1 day').save();
agenda.create('hourlyPullComEd').schedule('4:55pm').repeatEvery('1 hour').save();
agenda.create('hourlyChargeQuery').schedule('4:56pm').repeatEvery('1 hour').save();		

module.exports = agenda;
