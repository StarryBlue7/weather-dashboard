function getWeather(city, units) {
    if (!units) {
        units = "imperial"
    }
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/onecall?' 
            + 'lat=' + city.lat
            + '&lon=' + city.lon 
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

function displayToday(response, city, units) {
    const current = response.current;
    const date = moment().format("dddd, MMMM Do");

    const icon = getIcon(current.weather[0].icon, current.weather[0].description)
    const header = $('<h2>').text(city.name + ' on ' + date).prepend(icon);
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

$('#search-btn').on('click', function(event) {
    event.preventDefault();
    cityQuery = $('#search-box').val();
    getCoordinates(cityQuery); 
});

function getCoordinates(cityQuery) {
    if (!cityQuery) {
        cityQuery = "San Francisco"
    }
    $.ajax({
        url: 'http://api.openweathermap.org/geo/1.0/direct?' 
            + 'q=' + cityQuery
            + '&limit=' + 1 
            + '&appid=48ccf0d7dcd5e9995e55bdbae3480a14',
        method: 'GET',
      }).then(function (response) {
        console.log(response[0]);

        city = {
            name: response[0].name,
            state: response[0].state,
            lat: response[0].lat,
            lon: response[0].lon
        }
    
        getWeather(city);
        // saveHistory(city);
      });
}

function init() {
    searchHistory = localStorage.getItem("searchHistory");
    if (!searchHistory) {
        getWeather(37.795505,-122.400469, "San Francisco", "metric");
    } else {
        getWeather(searchHistory[0].lat, searchHistory[0].lon, searchHistory[0].city);
    }
}

// init();