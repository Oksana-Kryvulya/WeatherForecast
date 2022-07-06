function getBaseGeoUrl() {
  return `https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${getApiKey()}`;
}

function getBaseWeatherUrl() {
  return `https://api.openweathermap.org/data/3.0/onecall?exclude=hourly&appid=${getApiKey()}`;
}
function getApiKey() {
  return "e8e6c14c32a29720f6e13266006ad7c5";
}
function getBaseReverseGeoUrl() {
  return `https://api.openweathermap.org/geo/1.0/reverse?limit=1&appid=${getApiKey()}`;
}

function updateForecastData(forecastDailyData) {
  let i = 0;
  let weekForecastDay = document.querySelectorAll("li.temp .dayTime");
  let weekForecastNight = document.querySelectorAll("li.temp .nightTime");
  weekForecastDay.forEach(function (day) {
    day.innerHTML = Math.round(forecastDailyData[i].temp.day);
    i++;
  });
  i = 0;
  weekForecastNight.forEach(function (day) {
    day.innerHTML = Math.round(forecastDailyData[i].temp.night);
    i++;
  });
}
function updateCurrentWeather(currentData) {
  let temp = Math.round(currentData.temp);
  let currentTemperatura = document.querySelector("#current-temp");
  currentTemperatura.innerHTML = temp;
  let humidity = currentData.humidity;
  let currentHumidity = document.querySelector("#humidity");
  currentHumidity.innerHTML = humidity;
  let wind = currentData.wind_speed;
  let currentWind = document.querySelector("#wind");
  currentWind.innerHTML = wind;
}
function updateWeatherData(response) {
  updateCurrentWeather(response.data.current);
  updateForecastData(response.data.daily);
}
function updateCityData(city, country) {
  let cityNameP = document.querySelector("#city");
  let cityNameH1 = document.querySelector("#city-h1");
  let countryName = document.querySelector("#country");
  cityNameP.innerHTML = city;
  cityNameH1.innerHTML = city;
  countryName.innerHTML = country;
}
function changeWeatherData(lat, lon) {
  let unit = document.querySelector("#celsius").classList.contains("active")
    ? "metric"
    : "imperial";
  axios
    .get(`${getBaseWeatherUrl()}&lat=${lat}&lon=${lon}&units=${unit}`)
    .then(updateWeatherData);
}
function setWeather(response) {
  let city = response.data[0].name;
  let lat = response.data[0].lat;
  let lon = response.data[0].lon;
  let country = response.data[0].country;

  updateCityData(city, country);
  changeWeatherData(lat, lon);
}

function changeCityName(event) {
  event.preventDefault();
  let input = document.querySelector("#input-city");
  axios.get(`${getBaseGeoUrl()}&q=${input.value}`).then(setWeather);
}

function convertToUnits(value, units) {
  return units === "fahrenheit"
    ? Math.round((value * 9) / 5 + 32)
    : Math.round(((value - 32) * 5) / 9);
}

function changeForecastUnits(units) {
  let weekForecastDay = document.querySelectorAll("li.temp .dayTime");
  let weekForecastNight = document.querySelectorAll("li.temp .nightTime");

  weekForecastDay.forEach(function (day) {
    day.innerHTML = convertToUnits(day.innerHTML, units);
  });
  weekForecastNight.forEach(function (day) {
    day.innerHTML = convertToUnits(day.innerHTML, units);
  });
}

function changeUnits(event) {
  event.preventDefault();
  let isActive = event.target.classList.contains("active");
  if (!isActive) {
    event.target.classList.add("active");
    event.target.classList.remove("hand");
    let id = event.target.id === "fahrenheit" ? "#celsius" : "#fahrenheit";
    let unit = document.querySelector(id);
    unit.classList.remove("active");
    unit.classList.add("hand");
    // change current temperatura
    let currentTemperatura = document.querySelector("#current-temp");
    let value = currentTemperatura.innerHTML;
    currentTemperatura.innerHTML = convertToUnits(value, event.target.id);
    let currentUnits = document.querySelector("#current-units");
    if (event.target.id === "fahrenheit") currentUnits.innerHTML = "°F";
    else currentUnits.innerHTML = "°C";

    changeForecastUnits(event.target.id);
  }
}

function getWeekDay(i, weekDays) {
  let currentDay = new Date().getDay();
  let index = currentDay + i;
  if (index > 6) index = index - 7;
  return weekDays[index];
}

function changeDaysOrder(weekDays) {
  let weekDaysArray = document.querySelectorAll("li.weekDay");
  let i = 0;
  weekDaysArray.forEach(function (day) {
    day.innerHTML = getWeekDay(i, weekDays);
    i++;
  });
}
function setInitialWeaterData(city) {
  axios.get(`${getBaseGeoUrl()}&q=${city}`).then(setWeather);
}

function setLocalWeather(event) {
  event.preventDefault();
  let input = document.querySelector("#input-city");
  input.value = "";
  navigator.geolocation.getCurrentPosition(handlePosition);
}
function setLocalCityName(response) {
  updateCityData(response.data[0].name, response.data[0].country);
}

function handlePosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  axios
    .get(`${getBaseReverseGeoUrl()}&lat=${lat}&lon=${lon}`)
    .then(setLocalCityName);
  changeWeatherData(lat, lon);
}

function initListeners() {
  let cityInput = document.querySelector("#input-city-form");
  cityInput.addEventListener("submit", changeCityName);

  let geolocation = document.querySelector("#location");
  geolocation.addEventListener("click", setLocalWeather);

  let meterUnitsCelsius = document.querySelector("#celsius");
  let meterUnitsFahrenheit = document.querySelector("#fahrenheit");

  meterUnitsCelsius.addEventListener("click", changeUnits);
  meterUnitsFahrenheit.addEventListener("click", changeUnits);
}
function setCurrentDayData() {
  let date = new Date();
  let weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  changeDaysOrder(weekDays);

  let weekDay = weekDays[date.getDay()];
  let todayWeekDay = document.querySelector("#weekday");
  todayWeekDay.innerHTML = weekDay;
  let todayDate = document.querySelector("#current-date");
  todayDate.innerHTML = " " + date.getDate();
  let currentTime = document.querySelector("#current-time");
  currentTime.innerHTML = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

setInitialWeaterData("Kharkiv");
setCurrentDayData();
initListeners();
