import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestCurrentWeather, requestForecast } from '../api/client';
import { AppRequestError } from '../api/errors';
import type { CityLocation } from '../../types/city';
import { weatherService } from './weatherService';

vi.mock('../api/client', () => ({
  requestCurrentWeather: vi.fn(),
  requestForecast: vi.fn(),
}));

const currentRequest = vi.mocked(requestCurrentWeather);
const forecastRequest = vi.mocked(requestForecast);

const kyiv: CityLocation = {
  name: 'Kyiv',
  country: 'UA',
  state: 'Kyiv City',
  lat: 50.45,
  lon: 30.52,
};

describe('weatherService', () => {
  beforeEach(() => {
    currentRequest.mockReset();
    forecastRequest.mockReset();
  });

  it('loads current weather and the five-day forecast through the worker client', async () => {
    currentRequest.mockResolvedValue({
      name: 'Kyiv',
      main: { temp: 6, feels_like: 4 },
      weather: [{ description: 'mist', icon: '50d' }],
    });
    forecastRequest.mockResolvedValue({
      city: {
        name: 'Kyiv',
        country: 'UA',
        timezone: 7200,
        coord: { lat: 50.45, lon: 30.52 },
      },
      list: [
        {
          dt: Date.parse('2026-01-16T00:00:00Z') / 1000,
          main: { temp: 2 },
          pop: 0.1,
        },
        {
          dt: Date.parse('2026-01-16T03:00:00Z') / 1000,
          main: { temp: 4 },
        },
      ],
    });
    const signal = new AbortController().signal;

    const forecast = await weatherService.load({ location: kyiv, locale: 'uk', signal });

    const query = { lat: 50.45, lon: 30.52, lang: 'uk' as const };
    expect(currentRequest).toHaveBeenCalledWith(query, signal);
    expect(forecastRequest).toHaveBeenCalledWith(query, signal);
    expect(forecast.location).toEqual(kyiv);
    expect(forecast.timezoneOffsetSeconds).toBe(7200);
    expect(forecast.current).toEqual({
      temperatureC: 6,
      feelsLikeC: 4,
      humidity: null,
      windSpeed: null,
      pressure: null,
      condition: { description: 'mist', icon: '50d' },
    });
    expect(forecast.entries).toHaveLength(2);
    expect(forecast.daily).toEqual([
      {
        localDate: '2026-01-16',
        averageTemperatureC: 3,
        condition: null,
        entryCount: 2,
      },
    ]);
  });

  it('propagates worker errors and cancellation', async () => {
    currentRequest.mockRejectedValue(new AppRequestError('not_found'));
    forecastRequest.mockResolvedValue({
      city: {
        name: 'Kyiv',
        country: 'UA',
        timezone: 7200,
        coord: { lat: 50.45, lon: 30.52 },
      },
      list: [],
    });

    await expect(weatherService.load({ location: kyiv, locale: 'en' })).rejects.toMatchObject({
      name: 'AppRequestError',
      code: 'not_found',
    });

    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';
    currentRequest.mockResolvedValue({ name: 'Kyiv', main: { temp: 1 } });
    forecastRequest.mockRejectedValue(aborted);
    await expect(weatherService.load({ location: kyiv, locale: 'en' })).rejects.toBe(aborted);
  });
});
