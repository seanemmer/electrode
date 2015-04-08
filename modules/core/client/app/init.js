'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

//Application config
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$mdThemingProvider',
	function($locationProvider, $mdThemingProvider) {
		//Setting HTML5 Location Mode
		$locationProvider.html5Mode(true).hashPrefix('!');

		//Material theming
		$mdThemingProvider.theme('default')
			.primaryPalette('cyan')
			.accentPalette('lime');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});