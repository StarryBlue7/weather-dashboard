function getWeather(city, lat, lon, units) {
    if (!units) {
        units = "imperial"
    }
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/onecall?' 
            + 'lat=' + lat
            + '&lon=' + lon 
            + '&units=' + units 
            + '&exclude=minutely' 
            + '&appid=48ccf0d7dcd5e9995e55bdbae3480a14',
        method: 'GET',
      }).then(function (response) {
        console.log(response);
        displayToday(city, response, units);
        displayForecast(response, units)
      });
}

getWeather(37.795505,-122.400469);

function displayToday(city, response, units) {
    const current = response.current;
    const date = moment().format("dddd, MMMM Do");

    let tempUnit;
    let speedUnit;
    if (!units || units === "imperial") {
        tempUnit = "F";
        speedUnit = "m/s";
    } else {
        tempUnit = "C";
        speedUnit = "mph";
    }

    const header = $('<h2>').text(city + ' on ' + date);
    const temperature = $('<p>').text('Temperature: ' + current.temp + '°' + tempUnit);
    const humidity = $('<p>').text('Humidity: ' + current.humidity + '%');
    const wind = $('<p>').text('Wind Speed: ' + current.wind_speed + ' ' + speedUnit);
    const uvIndexIcon = $('<p>').text('UV Index: ' + current.uvi);

    $('#current').html('')
    $('#current').append(header, temperature, humidity, wind, uvIndexIcon);
}

function getIcon(iconCode, description) {
    return "<img alt='" + description + " icon' src='http://openweathermap.org/img/wn/" + iconCode + "@2x.png'>"
}