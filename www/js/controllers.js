/* This simple app has only one view, and so only one controller.
 * Its job is to provide data (from the weatherData service) for display
 * by the html page (index.html).
 */
weatherApp.controller('MainCtrl',
    function($scope, $state, weatherData, LocationStore) {

        $scope.disableTap = function(){
          container = document.getElementsByClassName('pac-container');
          // disable ionic data tab
          angular.element(container).attr('data-tap-disabled', 'true');
          // leave input field if google-address-entry is selected
          angular.element(container).on("click", function(){
              document.getElementById('pac-input').blur();
          });
        }
        //read default settings into scope
        console.log('inside home');
        $scope.city = LocationStore.city;
        var latitude = LocationStore.latitude;
        var longitude = LocationStore.longitude;

        function initMap()
        {
          var input = /** @type {!HTMLInputElement} */(
            document.getElementById('pac-input'));


            var autocomplete = new google.maps.places.Autocomplete(input);

            autocomplete.addListener('place_changed', function() {
              var place = autocomplete.getPlace();

              var lat = place.geometry.location.lat();
              var lng = place.geometry.location.lng();
              console.log(lat + lng);
              MainCtrl.weatherInit(lat,lng);
              //angular.element(document.getElementById('please')).scope().update(lat,lng);
              //angular.element(document.getElementById('please')).scope().$apply();

              var address = '';
              if (place.address_components) {
                address = [
                  (place.address_components[0] && place.address_components[0].short_name || ''),
                  (place.address_components[1] && place.address_components[1].short_name || ''),
                  (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
              }

              //infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);

              //All Document Editing code
              //document.getElementById("header").innerHTML = "Weather in " + place.name;
              //document.getElementById("weatherStats").innerHTML =


            });
        }

        //call getCurrentWeather method in factory
        var weatherInit = function(lat, lng) {
            weatherData.getCurrentWeather(lat, lng).then(function() {
                $scope.tempCurrent = weatherData.tempNow();
                $scope.tempTomorrowHigh = weatherData.tempTomorrowHigh();
                $scope.tempTomorrowLow = weatherData.tempTomorrowLow();
                $scope.tempTonightLow = weatherData.tempToMidnightLow();
                $scope.weatherSummary = weatherData.weatherSummary();
                $scope.currentTime = weatherData.currentTime();
                $scope.realFeel = weatherData.realFeel();
                $scope.humidity = weatherData.humidity();
                $scope.wind = weatherData.wind();
                $scope.cloudCover = weatherData.cloudCover();
                $scope.visibility = weatherData.visibility();
                $scope.dewPoint = weatherData.dewPoint();
                $scope.precipitation = weatherData.precipitation();
                $scope.stormDistance = weatherData.stormDistance();
            });
        };

        weatherData.getLocation() // getLocation returns the position obj
            .then(function(position) {
                weatherInit(position.latitude, position.longitude);
            }, function(err) {
                console.log(err);
                weatherInit(latitude, longitude);
            });



    });



    // updates the weather information for a new location
    function updateHTML(lat, lng){

        var apiKey = 'd0d763687cc9d29c0a8fef2c10095883';
        var url = 'https://api.forecast.io/forecast/';
        var data;

        $.getJSON(url + apiKey + "/" + lat + "," + lng + "?callback=?", function(data) {
          console.log(data);
          $('#currentTemp').html(Math.round(data.currently.temperature) + " °F");
          $('#realFeelTemp').html(Math.round(data.currently.apparentTemperature) + " °F");

          // Return the index into hourly of the hour, if any, which
          // contains time (unix time in sec).  Return -1 if not found.
          // Assume the time in hourly.data is the start of the hour.
          this.findHour = function(time) {
              var i = 0;
              while (i < data.hourly.data.length &&
                     data.hourly.data[i].time > time) {
                  i++;
              }
              if (i < data.hourly.data.length) {
                  return i;
              } else {
                  return -1;
              }
          };

          // Return findHour() (i.e., index into hourly) for current time.
          this.findHourNow = function() {
              return this.findHour(Date.now() / 1000); // millisec -> sec
          };

          // Return findHour() (i.e., index into hourly) for 11:50pm today.
          this.findHourMidnight = function() {
              var d = new Date();
              d.setHours(23);
              d.setMinutes(50); // 11:50pm today
              return this.findHour(d.getTime() / 1000); // millisec -> sec
          };

          var low = Math.round(data.currently.temperature);
          var start = this.findHourNow();
          var end = this.findHourMidnight();
          if (start >= 0 && end >= 0) {
              for (var i = start; i <= end; i++) {
                  low = Math.min(low,
                          data.hourly.data[i].temperature);
              }
          }
          $('#tempLow').html(Math.round(low) + " °F");

          $('#tempRange').html(Math.round(data.daily.data[0].temperatureMax)+
                              "/" + Math.round(data.daily.data[0].temperatureMin) + " °F");
          $('#summary').html(data.daily.summary);

          var distance = data.currently.nearestStormDistance;
          if(distance > 0)
          {
            $('#stormDistance').html(distance + " Miles Away");
          }
          else if(distance == 0)
          {
            $('#stormDistance').html("Within 1 Mile");
          }
          else
          {
            $('#stormDistance').html("No Storm Nearby");
          }

          var precipitationProbability = data.currently.precipProbability;
          var precipitationType = data.currently.precipType;
          if(precipitationProbability != 0)
          {
            precipitationProbability *= 100;
            $('#precip').html(precipitationProbability + "% chance of " + precipitationType);
          }
          else
          {
            $('#precip').html(precipitationProbability + "%");
          }

          $('#wind').html(Math.round(data.currently.windSpeed) + " MPH");
          $('#humidity').html(Math.round(data.currently.humidity*100) + "%");

          var visibility = Math.round(data.currently.visibility);
          if(isNaN(visibility))
          {
            $('#visibility').html("Distance Unknown");
          }
          else
          {
            $('#visibility').html(visibility + " Miles");
          }



          var cover = data.currently.cloudCover*100;
          if(cover < 40)
          {
            $('#cloudCover').html("Clear Sky");
          }
          else if(40 <= cover && cover <  75)
          {
            $('#cloudCover').html("Scattered Clouds");
          }
          else if(75 <= cover && cover < 100)
          {
            $('#cloudCover').html("Mostly Cloudy");
          }
          else if(cover == 100)
          {
            $('#cloudCover').html("Overcast Sky");
          }

          $('#dewPoint').html(Math.round(data.currently.dewPoint) + " °F");

          this.currentTime = function() {
          var d = new Date();
          var day = d.getDay() + 1;
          var month = d.getMonth() + 1;
          var year = d.getFullYear();
          var hour = d.getHours();
          var minutes = d.getMinutes();
          var seconds = d.getSeconds();
          var amORpm = "AM";

          if(seconds < 10)
          {
            seconds = "0" + seconds;
          }
          if(minutes < 10)
          {
            minutes = "0" + minutes;
          }
          if(hour > 12)
          {
            hour -= 12;
            amORpm = "PM";
          }
          return month.toString() + "/" + day.toString() + "/" + year.toString() + " "
              + hour.toString() + ":" + minutes.toString() + ":" + seconds.toString()
              + " " + amORpm;
            };

            $('#dateTime').html(this.currentTime());

        });
    }

    // This example adds a search box to a map, using the Google Place Autocomplete
    // feature. People can enter geographical searches. The search box will return a
    // pick list containing a mix of places and predicted search terms.


    function initMap() {


      var input = /** @type {!HTMLInputElement} */(
        document.getElementById('pac-input'));


        var autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();

          var lat = place.geometry.location.lat();
          var lng = place.geometry.location.lng();
          console.log(lat + lng);
          updateHTML(lat,lng);
          //angular.element(document.getElementById('please')).scope().update(lat,lng);
          //angular.element(document.getElementById('please')).scope().$apply();

          var address = '';
          if (place.address_components) {
            address = [
              (place.address_components[0] && place.address_components[0].short_name || ''),
              (place.address_components[1] && place.address_components[1].short_name || ''),
              (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
          }

          //infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);

          //All Document Editing code
          document.getElementById("selectLocationText").innerHTML = "Weather in " + place.name;
          document.getElementById("pac-input").value = "";
          //document.getElementById("weatherStats").innerHTML =


        });

      }
