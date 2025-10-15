const CurrentWeather = ({ currentWeather }) => {
  if (!currentWeather) return null;

  return (
    <div className="current-weather">
      <img
        src={`/icons/${currentWeather.weatherIcon}.svg`}
        alt={currentWeather.description}
        className="weather-icon"
      />
      <h2 className="temperature">
        {currentWeather.temperature}
        <span>°C</span>
      </h2>
      <p className="description">{currentWeather.description}</p>
    </div>
  );
};

export default CurrentWeather;
