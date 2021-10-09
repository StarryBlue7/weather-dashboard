// Units can be set to metric here
const units =  "imperial";

// Get weather based on city latitude and longitude from OneCall API
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
        displayForecast(response, units);
        displayBg(city);
      });
}

// Display today's weather
function displayToday(response, city, units) {
    const current = response.current;
    
    const icon = getIcon(current.weather[0].icon, current.weather[0].description)
    const cityName = $('<h2>').text(city.name).attr('id', 'city-name').prepend(icon);
    const date = $('<h2>').text('on ' + moment().format("dddd, MMMM Do")).attr('id', 'date');
    const temperature = $('<p>').text('Temperature: ' + current.temp + ' ' + getUnits(units).temperature);
    const humidity = $('<p>').text('Humidity: ' + current.humidity + '%');
    const wind = $('<p>').text('Wind Speed: ' + current.wind_speed + ' ' + getUnits(units).speed);
    const uvIndexIcon = $('<em>').text(current.uvi).addClass('uv ' + getUVClass(current.uvi));
    const uvIndex = $('<p>').text('UV Index: ').append(uvIndexIcon);

    $('#current').html('')
    $('#current').append(cityName, date, temperature, humidity, wind, uvIndex);
}

// Display 5-day forecast cards
function displayForecast(response, units) {
    const daily = response.daily;
    
    $('#forecast').html('')
    for (i = 1; i < 6; i++) {
        const date = $('<h5>').text(moment.unix(daily[i].dt).format("MM/DD"));
        const icon = getIcon(daily[i].weather[0].icon, daily[i].weather[0].description)
        const temperature = $('<p>').text('Temp: ' + daily[i].temp.day + ' ' + getUnits(units).temperature);
        const humidity = $('<p>').text('Humidity: ' + daily[i].humidity + ' ' + "%");

        let card = $('<div>').append(date, icon, temperature, humidity);
        card.attr('class', 'card text-white mr-3 mb-3 col-lg-2 col-md-3 col-sm-4');
        $('#forecast').append(card);
    }
}

// Set units
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

// Creates icon from data code
function getIcon(iconCode, description) {
    return "<img alt='" + description + " icon' src='https://openweathermap.org/img/wn/" + iconCode + "@2x.png'>"
}

// Colors UV Index by value
function getUVClass(uvi) {
    const uviVal = parseInt(uvi); 
    if (uviVal < 3) {
        return "uv-low";
    } else if (uviVal < 6) {
        return "uv-moderate";
    } else if (uviVal < 8) {
        return "uv-high";
    } else if (uviVal < 11) {
        return "uv-veryhigh";
    } else if (uviVal >= 11) {
        return "uv-extreme";
    }
}

$('#search-form').on('submit', function(event) {
    event.preventDefault();
    cityQuery = $('#search-box').val();
    getCoordinates(cityQuery); 
});

// Get city latitude and longitude from Geocoding API
function getCoordinates(cityQuery) {
    if (!cityQuery) {
        cityQuery = "San Francisco"
    }
    $.ajax({
        url: 'https://api.openweathermap.org/geo/1.0/direct?' 
            + 'q=' + cityQuery
            + '&limit=' + 1 
            + '&appid=48ccf0d7dcd5e9995e55bdbae3480a14',
        method: 'GET',
      }).then(function (response) {
        console.log(response[0]);

        if (response.length === 0) {
            return alert("City not found! Try again.");
        }
        city = {
            name: response[0].name,
            state: response[0].state,
            country: response[0].country,
            lat: response[0].lat,
            lon: response[0].lon
        }
    
        getWeather(city);
        saveHistory(city);
        showHistory();
      });
}

// Save history of city searches 
function saveHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (!searchHistory) {
        searchHistory = [];
    }

    const inHistory = (item) => item.name === city.name;
    if (searchHistory.findIndex(inHistory) > 0) {
        searchHistory.splice(searchHistory.findIndex(inHistory), 1);
        searchHistory.unshift(city);
    } else if (searchHistory.findIndex(inHistory) !== 0) {
        searchHistory.unshift(city);
    }

    while (searchHistory.length > 10) {
        searchHistory.pop();
    }
    
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function showHistory() {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    if (!searchHistory) {
        searchHistory = [];
    }
    $('#search-history').html('');
    $.each(searchHistory, function(i, entry) {
        const li = $('<li>').text(entry.name);
        li.attr('class', 'list-group-item');
        li.attr('data-index', i);
        $('#search-history').append(li);
    })
    setActive($("#search-history :first-child"));
}

// Use lat/lon of previous searches to skip repeated Geocoding API calls
$('#search-history').on('click', 'li',  function(event) {
    event.stopPropagation();
    const button = $(this);
    const index = button.attr('data-index');
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    const city = searchHistory[index];

    getWeather(city);
    setActive(button);
})

// Highlight selected city from search list
function setActive(button) {
    button.addClass('active');
    button.siblings().removeClass('active');
}

// Call Unsplash API for a randomly selected photo of searched city
function displayBg(city) {
    $.ajax({
        url: 'https://api.unsplash.com/photos/random?' 
            + '&query=' + city.name
            + '&client_id=uqF4UVdoAAVsj-bpVC81B0GGYmEv6vzzJYXzn_FidA8',
        method: 'GET',
      }).then(function (response) {
        console.log(response);
        $('body').css({
            'background-image': 'url(\'' + response.urls.full + '\')', 
            'background-size': 'cover', 
            'background-position': 'center'
        })
    });
}

// Get weather data for most recently searched city and display search history on page load
function init() {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (!searchHistory) {
        getWeather({lat: 37.795505, lon: -122.400469, name: "San Francisco"}, "imperial");
    } else {
        getWeather(searchHistory[0]);
    }
    showHistory();
}

init();