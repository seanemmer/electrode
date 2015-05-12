'use strict';

var agenda = require('agenda')(),
	mongoose = require('mongoose'),
	jobs = mongoose.connection.collection('jobs'),
	moment = require('moment');

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

var sixTill,
	fiveTill;

if(moment().minute() < 53) {
	sixTill = moment().endOf('hour').subtract(5, 'm').format('H:mmA');
	fiveTill = moment().endOf('hour').subtract(4, 'm').format('H:mmA');	
} else {
	console.log('b');
	sixTill = moment().endOf('hour').add(1, 'h').subtract(5, 'm').format('H:mmA');
	fiveTill = moment().endOf('hour').add(1, 'h').subtract(4, 'm').format('H:mmA');	
}

agenda.create('dailyPullComEd').schedule('3:53pm').repeatEvery('1 day').save();
agenda.create('hourlyPullComEd').schedule(sixTill).repeatEvery('1 hour').save();
agenda.create('hourlyChargeQuery').schedule(fiveTill).repeatEvery('1 hour').save();		

console.log('Clock process updated at ' + new Date());

module.exports = agenda;
