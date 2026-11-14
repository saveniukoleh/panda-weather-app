import type { WeatherLanguage } from '../../types/api';
import type { CityLocation } from '../../types/city';
import type { WeatherForecast } from '../../types/weather';
import { requestCurrentWeather, requestForecast } from '../api/client';
import { normalizeWeatherForecast } from './normalizeWeather';

export interface LoadWeatherInput {
  location: CityLocation;
  locale: WeatherLanguage;
  signal?: AbortSignal;
}

export const weatherService = {
  async load(input: LoadWeatherInput): Promise<WeatherForecast> {
    const query = {
      lat: input.location.lat,
      lon: input.location.lon,
      lang: input.locale,
    };
    const [current, forecast] = await Promise.all([
      requestCurrentWeather(query, input.signal),
      requestForecast(query, input.signal),
    ]);
    return normalizeWeatherForecast(input.location, current, forecast);
  },
};
