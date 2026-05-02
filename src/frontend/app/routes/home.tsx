import type { Route } from "./+types/home";
import { useState } from "react";
import type { FormEvent } from "react";
import { getWeatherForCity } from "../../features/weather/api";
import type { Weather } from "../../features/weather/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Weather App" },
    { name: "description", content: "Check current weather by city" },
  ];
}

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setErrorMessage("Please enter a city name.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const weatherData = await getWeatherForCity(normalizedCity);
      setWeather(weatherData);
    } catch {
      setWeather(null);
      setErrorMessage("Could not fetch weather for that city. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Weather by City</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter a city and get its current weather.
        </p>

        <form className="mt-6 flex gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="e.g. Berlin"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-500"
            aria-label="City"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Get Weather"}
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {weather ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-lg font-semibold text-gray-900">{weather.city}</h2>
            <p className="mt-1 text-gray-700">Temperature: {weather.temperature}°C</p>
            <p className="text-gray-700">Summary: {weather.summary}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
