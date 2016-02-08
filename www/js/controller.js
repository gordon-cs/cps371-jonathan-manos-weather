//controller.js



// https://github.com/driftyco/ionic/issues/1798
weatherApp.controller('MyCtrl', function($scope) {
  $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function(){
        document.getElementById('searchBar').blur();
    });
  };
})


weatherApp.controller('MainCtrl',
    function($scope,$state,WeatherData) {


	//call getCurrentWeather method in factory
	WeatherData.getCurrentWeather(globalLatitude, globalLongitude).then(function(resp) {
	    $scope.current = resp.data;
	    console.log('GOT CURRENT', $scope.current);
	}, function(error) {
	    alert('Unable to get current conditions');
	    console.error(error);
	});
    }
);
