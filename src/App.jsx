import "./App.css";
import axios from "axios";
import { useState } from "react";
import Weather from "./components/Weather";
import LoadingIndicator from "./components/LoadingIndicator";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_KEY = "92ae0d93f9a651dfc3d2e1707e5944cd";

  // Cache to store weather data for locations
  const [cache, setCache] = useState(new Map());

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      setError(null);

      // Check if the location's data is already cached
      if (cache.has(location)) {
        setData(cache.get(location));  // Use cached data
        return;
      }

      setLoading(true);
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${import.meta.env.VITE_API_KEY}`
        )
        .then((response) => {
          setData(response.data);
          setCache(new Map(cache.set(location, response.data)));  // Store the fetched data in cache
          setLoading(false);
        })
        .catch((err) => {
          setError("Location not found. Please try again.");
          setLoading(false);
        });
    }
  };

  const getLocationWeather = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          axios
            .get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_API_KEY}`
            )
            .then((response) => {
              setData(response.data);
              setLocation(response.data.name);
              setLoading(false);
            })
            .catch((err) => {
              setError("Unable to fetch weather data. Please try again.");
              setLoading(false);
            });
        },
        (error) => {
          setError("Error in getting location. Please allow location access.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-no-repeat bg-cover relative bg-weather-image flex flex-col items-center justify-center">
      <div className="text-center p-4">
        <input
          type="text"
          className="py-3 px-6 w-[700px] text-lg rounded-3xl border border-gray-200 text-gray-600 placeholder:text-gray-400 focus:outline-none bg-white-600/100 shadow-md"
          placeholder="Enter location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={searchLocation}
        />
        <button
          onClick={getLocationWeather}
          className="mt-4 py-3 px-6 text-lg rounded-3xl bg-blue-500 text-white shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Get Weather by Location
        </button>
      </div>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <p className="text-xl text-red-500 mt-4">{error}</p>
      ) : (
        <Weather weatherData={data} />
      )}
    </div>
  );
}

export default App;
