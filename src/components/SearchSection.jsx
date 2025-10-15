import React from "react";

const SearchSection = ({ getWeatherDetails, searchInputRef }) => {
  const API_KEY = import.meta.env.VITE_API_KEY;

  const handleCitySearch = (e) => {
    e.preventDefault();
    const input = e.target.querySelector(".search-input");
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${input.value}&days=2`;
    getWeatherDetails(API_URL);
  };

  const handleLocationSearch = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
        getWeatherDetails(API_URL);
        window.innerWidth >= 768 && searchInputRef.current.focus();
      },
      () => alert("Location access denied. Please enable permissions.")
    );
  };

  return (
    <>
      {/* ✅ Google Font import specific to this component only */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />

      <div className="search-section">
        <form className="search-form" onSubmit={handleCitySearch}>
          <span className="material-symbols-rounded">search</span>
          <input
            type="search"
            placeholder="Enter a city name"
            className="search-input"
            ref={searchInputRef}
            required
          />
        </form>
        <button className="location-button" onClick={handleLocationSearch}>
          <span className="material-symbols-rounded">my_location</span>
        </button>
      </div>
    </>
  );
};

export default SearchSection;
