'use strict';

module.exports = {
	app: {
		title: 'Electrode',
		description: 'Optimized charging for the Tesla Model S',
		keywords: 'battery, tesla, charge',
		googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'SDE',
	sessionCollection: 'sessions'
};
