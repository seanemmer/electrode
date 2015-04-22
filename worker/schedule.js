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

var dailyPullComEd = agenda.create('dailyPullComEd').schedule('4:25pm').repeatEvery('5 minutes').save();
var hourlyPullComEd = agenda.create('hourlyPullComEd').schedule('10:28am').repeatEvery('1 minute').save();	

module.exports = agenda;
