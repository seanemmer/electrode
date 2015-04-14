'use strict';

angular.module('core').controller('PricesCtrl', ['$scope', '$http',
	function($scope, $http) {
		$scope.date = moment();

		$scope.dateOptions = [
			moment(),
			moment().subtract(1, 'days'), 
			moment().subtract(2, 'days'), 
			moment().subtract(3, 'days')];

		// Pull day-ahead and real-time pricing data
		$scope.$watch('date', function(newValue, oldValue) {
			var pricingDate;
			var tempData = [[], []];

			// parse value of md-select option
			if(typeof(newValue) === 'object') {
				pricingDate = newValue.format('YYYYMMDD');
			} else {
				// handles moments passed back in through md-select
				pricingDate = newValue.substring(1,11).replace(/\D/g,'');
			}

			// initiate promise chain
			$http({
				url: '/cors-proxy',
				method: 'GET',
				params: {
					host: 'https://rrtp.comed.com/rrtp/ServletFeed',
					type: 'daynexttoday',
					date: pricingDate
				}
			})
			.then(function(payload) {
				// parse ComeEd data
				var payloadArray = payload.data.replace(/[\[\]]/g, '').split(', ');
				payloadArray.forEach(function(item, index) {
					if(index %2 !== 0) {
						tempData[0].push(parseFloat(item));
					}
				});	

				// return next request in promise chain
				return $http({
					url: '/cors-proxy',
					method: 'GET',
					params: {
						host: 'https://rrtp.comed.com/rrtp/ServletFeed',
						type: 'day',
						date: pricingDate
					}
				});
			}, function(response) {
				console.log('Error retreiving data!');
			})
			.then(function(payload) {
				var payloadArray = payload.data.replace(/[\[\]]/g, '').split(', ');
				var payloadCount = 0;
				payloadArray.forEach(function(item, index) {
					if(index %2 !== 0) {
						tempData[1].push(parseFloat(item));
						payloadCount++;
					}
				});	

				// fill remainder of realtime array with null values
				for (var i=0; i<(24-payloadCount); i++) {
					tempData[1].push(null);
				}

				// update chart data on scope
				$scope.chartData = tempData;
			}, function(response) {
				console.log('Error retreiving data!');
			});
		});

		$scope.labels = [$scope.date.format('MMM DD'), '', '2am', '', '4am', '', '6am', '', '8am', '', '10am', '', '12pm', '', '2pm', '', '4pm', '', '6pm', '', '8pm', '', '10pm', ''];
		$scope.series = ['Day-Ahead Hourly Price', 'Real-Time Hourly Price'];
 
	}
]);
