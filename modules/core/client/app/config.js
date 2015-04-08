'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'electrode';
	var applicationModuleVendorDependencies = [
		'ngResource', 
		'ngAnimate', 
		'ui.router', 
		'ui.utils', 
		'angularFileUpload',
		'ngMaterial',
		'ngMdIcons',
		'chart.js'
	];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	// Set Chart.js global colors

	var chartConfig = Chart.defaults.global;

	chartConfig.colours = [
		'#00BCD4',
		'#CDDC39'
	];

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
