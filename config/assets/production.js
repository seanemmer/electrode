'use strict';

module.exports = {
	client: {
		lib: {
			css: [
				'public/lib/angular-material/angular-material.css',
				'public/lib/angular-chart.js/dist/angular-chart.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-file-upload/angular-file-upload.js',
				'public/lib/angular-aria/angular-aria.js',
				'public/lib/angular-material/angular-material.js',
				'public/lib/angular-material-icons/angular-material-icons.js',
				'public/lib/Chart.js/Chart.js',
				'public/lib/angular-chart.js/dist/angular-chart.js',
				'public/lib/moment/moment.js',
				'public/lib/lodash/lodash.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	}
};
