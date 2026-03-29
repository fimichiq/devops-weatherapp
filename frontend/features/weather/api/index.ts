import axios from 'axios';
import type { Weather } from "features/weather/types/index";

const METEOSOURCE_API_KEY = import.meta.env.VITE_METEOSOURCE_API_KEY;


/**
 * Transforms the response from the Meteosource API into a Weather object.
 * @param city city for which we map weather
 * @param apiResponse respone from meteosource API
 * @returns Weather object representing weather in this area
 */
function mapApiResponseToWeatherData(city: string, apiResponse: any) {
    const temperature : number = apiResponse.current.temperature;
    const summary : string = apiResponse.current.summary;
    return {
        city: city,
        temperature: temperature,
        summary: summary
    } as Weather;
}

/**
 * Fetches the current weather for a given city using the Meteosource API.
 * @param city city for which we want to fetch weather
 * @returns Weather object 
 */
export function getWeatherForCity(city: string) {

    return axios.get(`https://www.meteosource.com/api/v1/free/point?place_id=${city}&sections=current&language=en&units=metric&key=${METEOSOURCE_API_KEY}`)
        .then(response => mapApiResponseToWeatherData(city, response.data))
        .catch(error => {
            console.error("Error fetching weather data:", error);
            throw error;
        });
}