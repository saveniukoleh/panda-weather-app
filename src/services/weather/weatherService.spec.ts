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

  it('does not let one city failure replace another in-flight load', async () => {
    const lviv = { name: 'Lviv', country: 'UA', lat: 49.84, lon: 24.03 };
    const kyivSignal = new AbortController().signal;
    const lvivSignal = new AbortController().signal;

    currentRequest.mockImplementation(async (query) => {
      if (query.lat === kyiv.lat) throw new AppRequestError('rate_limit');
      return { name: 'Lviv', main: { temp: 8 } };
    });
    forecastRequest.mockImplementation(async (query) => ({
      city: {
        name: query.lat === kyiv.lat ? 'Kyiv' : 'Lviv',
        country: 'UA',
        timezone: 7200,
        coord: { lat: query.lat, lon: query.lon },
      },
      list: [
        {
          dt: Date.parse('2026-01-16T00:00:00Z') / 1000,
          main: { temp: query.lat === kyiv.lat ? 1 : 9 },
        },
      ],
    }));

    const [failed, loaded] = await Promise.allSettled([
      weatherService.load({ location: kyiv, locale: 'en', signal: kyivSignal }),
      weatherService.load({ location: lviv, locale: 'uk', signal: lvivSignal }),
    ]);

    expect(currentRequest.mock.calls[0]?.[1]).toBe(kyivSignal);
    expect(forecastRequest.mock.calls[0]?.[1]).toBe(kyivSignal);
    expect(currentRequest.mock.calls[1]?.[1]).toBe(lvivSignal);
    expect(forecastRequest.mock.calls[1]?.[1]).toBe(lvivSignal);
    expect(failed).toMatchObject({ status: 'rejected', reason: { code: 'rate_limit' } });
    expect(loaded.status).toBe('fulfilled');
    if (loaded.status === 'fulfilled') {
      expect(loaded.value.location).toEqual(lviv);
      expect(loaded.value.current.temperatureC).toBe(8);
      expect(loaded.value.entries.map((entry) => entry.temperatureC)).toEqual([9]);
    }
  });
});
