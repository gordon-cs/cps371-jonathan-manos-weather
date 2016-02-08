//service.js

'use strict';

weatherApp.constant('FORECASTIO_KEY', '14e723fbe931ee119ade496aabcf28ba');


var globalLatitude  = 42.589611;
var globalLongitude = -70.819806;

// 'weather' is referenced in index.html, 2nd arg is dependencies
// 'weather' is referenced in index.html, 2nd arg is dependencies
var weatherApp = angular.module('weather', ['ionic', 'ngResource']);

var forecastioWeather = ['$q', '$resource', '$http', 'FORECASTIO_KEY',
    function($q, $resource, $http, FORECASTIO_KEY) {
	var url = 'https://api.forecast.io/forecast/' + FORECASTIO_KEY + '/';

	return {
	    getCurrentWeather: function(globalLatitude, globalLongitude) {
		return $http.jsonp(url + globalLatitude + ',' + globalLongitude +
				   '?callback=JSON_CALLBACK');
	    }
	}
    }
];
