import axios from 'axios';
import type { Weather } from "features/weather/types/index";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";


/**
 * Transforms the response from backend weather API into a Weather object.
 * @param apiResponse response from backend API
 * @returns Weather object representing weather in this area
 */
function mapApiResponseToWeatherData(apiResponse: any) {
    const temperature : number = apiResponse.temperature;
    const summary : string = apiResponse.summary;
    return {
        city: apiResponse.city,
        temperature: temperature,
        summary: summary
    } as Weather;
}

/**
 * Fetches the current weather for a given city from backend API.
 * @param city city for which we want to fetch weather
 * @returns Weather object
 */
export function getWeatherForCity(city: string) {

    return axios.get(`${BACKEND_URL}/api/weather`, {
        params: { city }
    })
        .then(response => mapApiResponseToWeatherData(response.data))
        .catch(error => {
            console.error("Error fetching weather data:", error);
            throw error;
        });
}