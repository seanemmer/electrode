'use strict';

module.exports = function(agenda) {

	agenda.define('pullComEd', function(job, done){
		console.log(new Date());
		console.log('It\'s 7pm!');
		done();
	});

	agenda.schedule('today at 7:00pm', 'pullComEd');
};
