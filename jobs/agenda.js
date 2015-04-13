'use strict';

var Agenda = require('agenda'),
	config = require('../config/config');

var agenda = new Agenda({ db: { address: config.db}});

var jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

jobTypes.forEach(function(type)  {
	require('./' + type)(agenda);
});

if(jobTypes.length) {
	agenda.start();
}

module.exports = agenda;
