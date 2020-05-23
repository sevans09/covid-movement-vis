function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  var fips = requestData(position.coords.latitude, position.coords.longitude);
}

function requestData(lat, long) {
    console.log(lat, long);
    // Step 1: create new instance of request object
    request = new XMLHttpRequest;
    console.log("1: request object created");
    // Step 2: Set the URL for the AJAX request to be the JSON file 
    request.open('GET', `https://geo.fcc.gov/api/census/area?lat=`+lat+`&lon=`+long+`&format=json`, true);
    console.log("2: opened request file");
    // Step 3: set up event handler / callback
    var geo_fips, geo_state;
    request.onload = function() {
        console.log("3: readystatechange event fired");

        if (request.readyState == 4 && request.status == 200) {
            var data = JSON.parse(request.responseText).results[0];
            console.log(data);
            geo_fips = data["county_fips"];
            console.log(data["county_fips"], data["county_name"]);
            geo_state = data["state_name"];
            console.log(data["state_name"]);
            // display bar chart with geolocated fips code
            displayBar(geo_fips);
            highlight_single(geo_fips);
            // make donut chart with geolocated state name
            //makeDonut(toTitleCase(geo_state), 320, 320);
        }
        else if (request.readyState == 4 && request.status != 200) {
            document.getElementById("results").innerHTML = "Uh Oh. Something went wrong."
        }
        else {
            console.log('Reached API but threw error');
        }
    }
    
    request.onerror = function() {
        console.log("Connection error");
    };

    // Step 4: fire off HTTP request
    request.send();
    console.log("4: Request sent");
  }
