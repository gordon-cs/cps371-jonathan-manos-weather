/* Notes on forecast.io's API:
 *  - daily.data[0] is today
 */

/* weatherStore holds data for weatherData service.
 */
weatherApp.factory('weatherStore', function() {
    var weatherStore = {
        current : {}
    };

    return weatherStore;
});

/* weatherData service gets weather data (current, forecasts, and
 * historical), processes it as necessary, and provides it to controllers.
 */
weatherApp.service('weatherData', ['$q', '$resource', '$http',
                                   'FORECASTIO_KEY', 'weatherStore',
    function($q, $resource, $http, FORECASTIO_KEY, weatherStore) {
        this.getCurrentWeather = function(lat, lng) {
            var url = 'https://api.forecast.io/forecast/' +
                FORECASTIO_KEY + "/" + lat + ',' + lng;

            // JSONP is only needed for "ionic serve".
            // Simpler $http.get(url) works on devices.
            return $http.jsonp(url + '?callback=JSON_CALLBACK').then(
                function success(resp) {
                    weatherStore.current = resp.data;
                    console.log('GOT CURRENT');
                    //console.dir(weatherStore.current);
                },
                function failure(error) {
                    alert('Unable to get current conditions');
                    console.error(error);
                });
        };

        this.getLocation = function() {
            return $q(function(resolve, reject) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, function(err) {
                    reject(err);
                });
            });
        };

        // TODO: move roundTemp into controller, since it is part of
        // presentation, not weather data.

        // Round temp to tenths of a degree.
        this.roundTemp = function(temp) {
            if (Math.abs(temp) >= 9.5) {
                return temp.toPrecision(2);
            } else {
                return temp.toPrecision(1);
            }
        };

        // Return current temperature
        this.tempNow = function() {
            return Math.round(weatherStore.current.currently.temperature);
        };

        // Return current storm distance
        this.stormDistance = function() {
            var distance = weatherStore.current.currently.nearestStormDistance;
            if(distance > 0)
            {
              return weatherStore.current.currently.nearestStormDistance  + " Miles Away";
            }
            else
            {
              return "No Storm Nearby";
            }
        };

        // Return real feel temperature
        this.realFeel = function() {
            return Math.round(weatherStore.current.currently.apparentTemperature);
        };

        // Return weekly summary
        this.weatherSummary = function() {
            return weatherStore.current.daily.summary;
        };

        // Return wind speed
        this.wind = function() {
            return Math.round(weatherStore.current.currently.windSpeed);
        };

        // Return visibility
        this.visibility = function() {
            var visibility = Math.round(weatherStore.current.currently.visibility);
            if(isNaN(visibility))
            {
              return "Unknown";
            }
            else
            {
              return visibility;
            }
        };

        // Return cloud cover
        this.cloudCover = function() {
            var cover = weatherStore.current.currently.cloudCover*100;
            if(cover < 40)
            {
              return "Clear Sky";
            }
            else if(40 <= cover && cover <  75)
            {
              return "Scattered Clouds";
            }
            else if(75 <= cover && cover < 100)
            {
              return "Mostly Cloudy";
            }
            else if(cover == 100)
            {
              return "Overcast Sky";
            }
            else
              return cover;
        };

        // Return dew point
        this.dewPoint = function() {
            return Math.round(weatherStore.current.currently.dewPoint);
        };

        // Return humidity
        this.humidity = function() {
            return weatherStore.current.currently.humidity*100;
        };



        // Return precipitation chance and type
        this.precipitation = function() {
            var precipitationProbability = weatherStore.current.currently.precipProbability;
            var precipitationType = weatherStore.current.currently.precipType;
            if(precipitationProbability != 0)
            {
              precipitationProbability *= 100;
              return precipitationProbability + "% chance of " + precipitationType;
            }
            else
            {
              return precipitationProbability + "%";
            }
        };

        // Return tomorrow's high temperature.
        this.tempTomorrowHigh = function() {
            return Math.round(weatherStore.current.daily.data[0].temperatureMax);
        };

        // Return tomorrow's low temperature.
        this.tempTomorrowLow = function() {
            return Math.round(weatherStore.current.daily.data[0].temperatureMin);
        };

        this.tempToMidnightLow = function() {
            var low = this.tempNow();
            var start = this.findHourNow();
            var end = this.findHourMidnight();
            if (start >= 0 && end >= 0) {
                for (var i = start; i <= end; i++) {
                    low = Math.min(low,
                            weatherStore.current.hourly.data[i].temperature);
                }
            }

            return Math.round(low);
        };

        // Return the index into hourly of the hour, if any, which
        // contains time (unix time in sec).  Return -1 if not found.
        // Assume the time in hourly.data is the start of the hour.
        this.findHour = function(time) {
            var i = 0;
            while (i < weatherStore.current.hourly.data.length &&
                   weatherStore.current.hourly.data[i].time > time) {
                i++;
            }
            if (i < weatherStore.current.hourly.data.length) {
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
    }]);
