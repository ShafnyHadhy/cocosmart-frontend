import React, { useEffect, useRef, useState } from "react";
import SearchSection from "../../components/SearchSection";
import CurrentWeather from "../../components/CurrentWeather";
import HourlyWeatherItem from "../../components/HourlyWeatherItem";
import NoResultsDiv from "../../components/NoResultsDiv";
import { weatherCodes } from "../../constants";
import "./Weather.css";

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);
  const API_KEY = import.meta.env.VITE_API_KEY;

  // ✅ Filter to next 24 hours
  const filterHourlyForecast = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0);
    const next24Hours = currentHour + 24 * 60 * 60 * 1000;
    const next24HoursData = hourlyData.filter(({ time }) => {
      const forecastTime = new Date(time).getTime();
      return forecastTime >= currentHour && forecastTime <= next24Hours;
    });
    setHourlyForecasts(next24HoursData);
  };

  // ✅ Fetch weather details
  const getWeatherDetails = async (API_URL) => {
    setHasNoResults(false);
    if (window.innerWidth <= 768) searchInputRef.current.blur();

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch weather data");

      const data = await response.json();
      const temperature = Math.floor(data.current.temp_c);
      const description = data.current.condition.text;
      const conditionCode = data.current.condition.code;

      // ✅ Correct icon mapping using constants.js
      const weatherIcon =
        Object.keys(weatherCodes).find((key) =>
          weatherCodes[key].includes(conditionCode)
        ) || "clear";

      // ✅ Set current weather
      setCurrentWeather({ temperature, description, weatherIcon });

      // ✅ Combine hourly data from two days
      const combinedHourlyData = [
        ...data.forecast.forecastday[0].hour,
        ...data.forecast.forecastday[1].hour,
      ];

      // ✅ Update search bar text
      searchInputRef.current.value = data.location.name;

      // ✅ Filter next 24 hours
      filterHourlyForecast(combinedHourlyData);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setHasNoResults(true);
    }
  };

  // ✅ Default load on mount
  useEffect(() => {
    const defaultCity = "London";
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${defaultCity}&days=2`;
    getWeatherDetails(API_URL);
  }, []);

  return (
    <div className="weather-page">
      <div className="container">
        <SearchSection
          getWeatherDetails={getWeatherDetails}
          searchInputRef={searchInputRef}
        />

        {hasNoResults ? (
          <NoResultsDiv />
        ) : (
          <div className="weather-section">
            {currentWeather && <CurrentWeather currentWeather={currentWeather} />}

            <div className="hourly-forecast">
              <ul className="weather-list">
                {hourlyForecasts.map((hourlyWeather) => (
                  <HourlyWeatherItem
                    key={hourlyWeather.time_epoch}
                    hourlyWeather={hourlyWeather}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
