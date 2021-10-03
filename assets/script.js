function getWeather(lat, lon, city, units) {
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
        displayToday(response, city, units);
        displayForecast(response, units)
      });
}

getWeather(37.795505,-122.400469, "San Francisco", "metric");

function displayToday(response, city, units) {
    const current = response.current;
    const date = moment().format("dddd, MMMM Do");

    const icon = getIcon(current.weather[0].icon, current.weather[0].description)
    const header = $('<h2>').text(city + ' on ' + date).prepend(icon);
    const temperature = $('<p>').text('Temperature: ' + current.temp + ' ' + getUnits(units).temperature);
    const humidity = $('<p>').text('Humidity: ' + current.humidity + '%');
    const wind = $('<p>').text('Wind Speed: ' + current.wind_speed + ' ' + getUnits(units).speed);
    const uvIndexIcon = $('<p>').text('UV Index: ' + current.uvi);

    $('#current').html('')
    $('#current').append(header, temperature, humidity, wind, uvIndexIcon);
}

function displayForecast(response, units) {
    const daily = response.daily;
    
    $('#forecast').html('')
    for (i = 0; i < 5; i++) {
    // daily.each(function() {
        const date = $('<h5>').text(moment.unix(daily[i].dt).format("MM/DD"));
        const icon = getIcon(daily[i].weather[0].icon, daily[i].weather[0].description)
        const temperature = $('<p>').text('Temp: ' + daily[i].temp.day + ' ' + getUnits(units).temperature);
        const humidity = $('<p>').text('Humidity: ' + daily[i].humidity + ' ' + "%");

        let card = $('<div>').append(date, icon, temperature, humidity);
        card.attr('class', 'card text-white bg-primary mr-3 mb-3 col-lg-2 col-md-3 col-sm-4');
        $('#forecast').append(card);
    }

}

function getUnits(units) {
    if (!units || units === "imperial") {
        return {
            temperature: "°F",
            speed: "mph"
        }
    } 
    return {
        temperature: "°C",
        speed: "m/s"
    }
}



function getIcon(iconCode, description) {
    return "<img alt='" + description + " icon' src='http://openweathermap.org/img/wn/" + iconCode + "@2x.png'>"
}