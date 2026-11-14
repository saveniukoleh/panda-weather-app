import { describe, expect, it } from 'vitest';
import type { CurrentWeatherPayload, ForecastPayload } from '../api/validate';
import type { CityLocation } from '../../types/city';
import {
  currentDayForecastEntries,
  localCalendarDate,
  normalizeCurrentWeather,
  normalizeWeatherForecast,
  toWeatherChartDatasets,
} from './normalizeWeather';

const TOKYO_OFFSET_SECONDS = 9 * 60 * 60;
const HONOLULU_OFFSET_SECONDS = -10 * 60 * 60;

const kyiv: CityLocation = {
  name: 'Kyiv',
  country: 'UA',
  state: 'Kyiv City',
  lat: 50.45,
  lon: 30.52,
};

function unix(isoUtc: string): number {
  return Date.parse(isoUtc) / 1000;
}

function currentPayload(
  overrides: Partial<CurrentWeatherPayload['main']> & {
    weather?: CurrentWeatherPayload['weather'];
    wind?: CurrentWeatherPayload['wind'];
  } = {},
): CurrentWeatherPayload {
  const { weather, wind, ...main } = overrides;
  return {
    name: 'Provider Name',
    main: { temp: 11, ...main },
    weather,
    wind,
  };
}

function forecastPayload(
  list: ForecastPayload['list'],
  timezone = TOKYO_OFFSET_SECONDS,
): ForecastPayload {
  return {
    city: {
      name: 'Tokyo',
      country: 'JP',
      timezone,
      coord: { lat: 35.69, lon: 139.69 },
    },
    list,
  };
}

function slot(
  isoUtc: string,
  temp: number,
  extras: { pop?: number; weather?: ForecastPayload['list'][number]['weather'] } = {},
): ForecastPayload['list'][number] {
  return {
    dt: unix(isoUtc),
    main: { temp },
    pop: extras.pop,
    weather: extras.weather,
  };
}

describe('normalizeCurrentWeather', () => {
  it('maps the current observation and leaves missing fields null', () => {
    expect(normalizeCurrentWeather(currentPayload())).toEqual({
      temperatureC: 11,
      feelsLikeC: null,
      humidity: null,
      windSpeed: null,
      pressure: null,
      condition: null,
    });
  });

  it('keeps optional measurements and the first condition', () => {
    expect(
      normalizeCurrentWeather(
        currentPayload({
          feels_like: 9,
          humidity: 70,
          pressure: 1012,
          wind: { speed: 4.5 },
          weather: [
            { description: 'light rain', icon: '10d' },
            { description: 'ignored', icon: '01d' },
          ],
        }),
      ),
    ).toEqual({
      temperatureC: 11,
      feelsLikeC: 9,
      humidity: 70,
      windSpeed: 4.5,
      pressure: 1012,
      condition: { description: 'light rain', icon: '10d' },
    });
  });

  it('drops a condition that has an empty description or icon', () => {
    expect(
      normalizeCurrentWeather(currentPayload({ weather: [{ description: ' ', icon: '10d' }] }))
        .condition,
    ).toBeNull();
  });
});

describe('forecast normalization', () => {
  const nowUnix = unix('2026-01-16T02:00:00Z');

  const payload = forecastPayload([
    slot('2026-01-16T15:00:00Z', 10, { pop: 0.2 }),
    slot('2026-01-15T18:00:00Z', 3, {
      weather: [{ description: 'clouds', icon: '03d' }],
    }),
    slot('2026-01-15T15:00:00Z', 1, { pop: 0 }),
    slot('2026-01-16T03:00:00Z', 5, {
      weather: [{ description: 'clear', icon: '01d' }],
    }),
    slot('2026-01-17T06:00:00Z', 20),
  ]);

  it('sorts five-day slots and preserves the requested city', () => {
    const forecast = normalizeWeatherForecast(kyiv, currentPayload(), payload);

    expect(forecast.location).toEqual(kyiv);
    expect(forecast.timezoneOffsetSeconds).toBe(TOKYO_OFFSET_SECONDS);
    expect(forecast.current?.temperatureC).toBe(11);
    expect(forecast.entries.map((entry) => entry.temperatureC)).toEqual([1, 3, 5, 10, 20]);
    expect(forecast.entries[0]?.precipitationProbability).toBe(0);
    expect(forecast.entries[3]?.precipitationProbability).toBe(0.2);
    expect(forecast.entries[4]?.precipitationProbability).toBeNull();
    expect(forecast.entries[4]?.condition).toBeNull();
  });

  it('groups timestamps by the city offset rather than the UTC date', () => {
    expect(localCalendarDate(unix('2026-01-15T15:00:00Z'), TOKYO_OFFSET_SECONDS)).toBe(
      '2026-01-16',
    );
    expect(localCalendarDate(unix('2026-01-15T14:00:00Z'), TOKYO_OFFSET_SECONDS)).toBe(
      '2026-01-15',
    );
    expect(localCalendarDate(unix('2026-01-16T10:00:00Z'), HONOLULU_OFFSET_SECONDS)).toBe(
      '2026-01-16',
    );
    expect(localCalendarDate(unix('2026-01-16T09:00:00Z'), HONOLULU_OFFSET_SECONDS)).toBe(
      '2026-01-15',
    );

    const forecast = normalizeWeatherForecast(kyiv, currentPayload(), payload);
    expect(forecast.daily.map((day) => day.localDate)).toEqual(['2026-01-16', '2026-01-17']);
  });

  it('extracts only the current local calendar day', () => {
    const forecast = normalizeWeatherForecast(kyiv, currentPayload(), payload);
    const today = currentDayForecastEntries(forecast, nowUnix);

    expect(today.map((entry) => entry.temperatureC)).toEqual([1, 3, 5]);
    expect(
      today.every(
        (entry) => localCalendarDate(entry.timestampUnix, TOKYO_OFFSET_SECONDS) === '2026-01-16',
      ),
    ).toBe(true);
  });

  it('averages only the temperatures that exist for each local day', () => {
    const forecast = normalizeWeatherForecast(kyiv, currentPayload(), payload);

    expect(forecast.daily).toEqual([
      {
        localDate: '2026-01-16',
        averageTemperatureC: 3,
        condition: { description: 'clear', icon: '01d' },
        entryCount: 3,
      },
      {
        localDate: '2026-01-17',
        averageTemperatureC: 15,
        condition: null,
        entryCount: 2,
      },
    ]);
  });

  it('uses the condition closest to local noon when the noon slot has none', () => {
    const forecast = normalizeWeatherForecast(
      kyiv,
      currentPayload(),
      forecastPayload([
        slot('2026-01-15T15:00:00Z', 1),
        slot('2026-01-15T18:00:00Z', 3, {
          weather: [{ description: 'clouds', icon: '03d' }],
        }),
        slot('2026-01-16T03:00:00Z', 5, { weather: [{ description: ' ', icon: '01d' }] }),
      ]),
    );

    expect(forecast.daily[0]?.condition).toEqual({ description: 'clouds', icon: '03d' });
  });

  it('builds chart series from current-day slots and daily averages', () => {
    const forecast = normalizeWeatherForecast(kyiv, currentPayload(), payload);

    expect(toWeatherChartDatasets(forecast, nowUnix)).toEqual({
      currentDay: [
        { label: '00:00', temperatureC: 1 },
        { label: '03:00', temperatureC: 3 },
        { label: '12:00', temperatureC: 5 },
      ],
      dailyAverages: [
        { label: '2026-01-16', temperatureC: 3 },
        { label: '2026-01-17', temperatureC: 15 },
      ],
    });
  });

  it('keeps a negative offset on the previous local date', () => {
    const forecast = normalizeWeatherForecast(
      kyiv,
      currentPayload(),
      forecastPayload(
        [slot('2026-01-16T08:00:00Z', 4), slot('2026-01-16T10:00:00Z', 8)],
        HONOLULU_OFFSET_SECONDS,
      ),
    );
    const today = currentDayForecastEntries(forecast, unix('2026-01-16T08:00:00Z'));

    expect(today.map((entry) => entry.temperatureC)).toEqual([4]);
    expect(forecast.daily.map((day) => day.localDate)).toEqual(['2026-01-15', '2026-01-16']);
    expect(toWeatherChartDatasets(forecast, unix('2026-01-16T08:00:00Z')).currentDay).toEqual([
      { label: '22:00', temperatureC: 4 },
    ]);
  });

  it('omits days and chart points when forecast values are missing', () => {
    const forecast = normalizeWeatherForecast(
      kyiv,
      currentPayload(),
      forecastPayload([
        slot('2026-01-15T15:00:00Z', 2),
        { dt: Number.NaN, main: { temp: 99 } },
        { dt: unix('2026-01-16T03:00:00Z'), main: { temp: Number.NaN } },
      ]),
    );

    expect(forecast.entries).toEqual([
      {
        timestampUnix: unix('2026-01-15T15:00:00Z'),
        temperatureC: 2,
        condition: null,
        precipitationProbability: null,
      },
    ]);
    expect(forecast.daily).toEqual([
      {
        localDate: '2026-01-16',
        averageTemperatureC: 2,
        condition: null,
        entryCount: 1,
      },
    ]);
    expect(toWeatherChartDatasets(forecast, unix('2026-01-17T00:00:00Z'))).toEqual({
      currentDay: [],
      dailyAverages: [{ label: '2026-01-16', temperatureC: 2 }],
    });
  });

  it('returns empty forecast collections when the provider list is empty', () => {
    const forecast = normalizeWeatherForecast(kyiv, currentPayload(), forecastPayload([]));

    expect(forecast.entries).toEqual([]);
    expect(forecast.daily).toEqual([]);
    expect(forecast.current?.temperatureC).toBe(11);
    expect(toWeatherChartDatasets(forecast, nowUnix)).toEqual({
      currentDay: [],
      dailyAverages: [],
    });
  });
});
