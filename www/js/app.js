//app.js






weatherApp.factory('WeatherData', forecastioWeather);

function b(){

    var apiKey = '14e723fbe931ee119ade496aabcf28ba';
    var url = 'https://api.forecast.io/forecast/';
    var data;

    $.getJSON(url + apiKey + "/" + globalLatitude + "," + globalLongitude + "?callback=?", function(data) {
      console.log(data);
      $('#temperature').html("Current Temperature: " + data.currently.temperature + " °F");
      $('#summary').html(data.daily.summary);
      $('#stormDistance').html(data.currently.nearestStormDistance + " Miles Away");
      $('#realFeel').html("Real Feel: " + data.currently.apparentTemperature + " °F");
      $('#precip').html("Precipitation Chance: " + data.currently.precipProbability*100 + "%");
      if(!data.currently.precipProbability==0){
      $('#precipType').html("Precipitation Type: " + data.currently.precipType);
      }
      $('#wind').html("Wind Speed: " + data.currently.windSpeed + " Miles per Hour");
      $('#humidity').html("Humidity: " + data.currently.humidity*100 + "%");
      $('#status').html(data.currently.summary);
    });
}



function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };


      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }


  var input = /** @type {!HTMLInputElement} */(
    document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();

      globalLatitude = place.geometry.location.lat();
      globalLongitude = place.geometry.location.lng();

      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);

      //All Document Editing code
      document.getElementById("header").innerHTML = "Weather in " + place.name;
      //document.getElementById("weatherStats").innerHTML =


    });

  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    }
