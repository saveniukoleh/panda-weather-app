import { describe, expect, it } from 'vitest';
import { AppRequestError } from './errors';
import {
  assertCoordinates,
  assertCurrentWeatherPayload,
  assertForecastPayload,
  assertGeocodingLimit,
  assertGeocodingPayload,
  assertGeocodingQuery,
  assertWeatherLanguage,
} from './validate';

describe('request validation', () => {
  it('accepts a trimmed city query, default limit, coordinates, and supported languages', () => {
    expect(assertGeocodingQuery('  Київ  ')).toBe('Київ');
    expect(assertGeocodingLimit(undefined)).toBe(5);
    expect(() => assertCoordinates(90, -180)).not.toThrow();
    expect(assertWeatherLanguage('uk')).toBe('uk');
    expect(assertWeatherLanguage(undefined)).toBeUndefined();
  });

  it('rejects empty queries, out-of-range values, and unsupported languages', () => {
    expect(() => assertGeocodingQuery('   ')).toThrow(AppRequestError);
    expect(() => assertGeocodingQuery('a'.repeat(101))).toThrow(AppRequestError);
    expect(() => assertGeocodingQuery('Kyiv\n')).toThrow(AppRequestError);
    expect(() => assertGeocodingLimit(0)).toThrow(AppRequestError);
    expect(() => assertGeocodingLimit(6)).toThrow(AppRequestError);
    expect(() => assertCoordinates(90.1, 0)).toThrow(AppRequestError);
    expect(() => assertWeatherLanguage('fr')).toThrow(AppRequestError);
  });
});

describe('response validation', () => {
  it('accepts an empty geocoding list and a complete place', () => {
    expect(assertGeocodingPayload([])).toEqual([]);
    expect(
      assertGeocodingPayload([
        { name: 'Kyiv', country: 'UA', state: 'Kyiv City', lat: 50.45, lon: 30.52, extra: true },
      ]),
    ).toEqual([{ name: 'Kyiv', country: 'UA', state: 'Kyiv City', lat: 50.45, lon: 30.52 }]);
  });

  it('rejects a geocoding payload that is not a list of places', () => {
    expect(() => assertGeocodingPayload({ name: 'Kyiv' })).toThrow(AppRequestError);
    expect(() =>
      assertGeocodingPayload([{ name: 'Kyiv', country: 'UA', lat: '50', lon: 30 }]),
    ).toThrow(AppRequestError);
  });

  it('accepts current weather and forecast payloads with the required fields', () => {
    expect(assertCurrentWeatherPayload({ name: 'Kyiv', main: { temp: 12.5 } })).toEqual({
      name: 'Kyiv',
      main: { temp: 12.5 },
    });

    expect(
      assertForecastPayload({
        city: { name: 'Kyiv', country: 'UA', timezone: 10800, coord: { lat: 50.45, lon: 30.52 } },
        list: [{ dt: 1_700_000_000, main: { temp: 3 }, pop: 0.2 }],
      }),
    ).toEqual({
      city: { name: 'Kyiv', country: 'UA', timezone: 10800, coord: { lat: 50.45, lon: 30.52 } },
      list: [{ dt: 1_700_000_000, main: { temp: 3 }, pop: 0.2 }],
    });
  });

  it('rejects incomplete weather payloads', () => {
    expect(() => assertCurrentWeatherPayload({ name: 'Kyiv', main: { temp: '12' } })).toThrow(
      AppRequestError,
    );
    expect(() =>
      assertCurrentWeatherPayload({ name: 'Kyiv', main: { temp: 12, feels_like: 'cold' } }),
    ).toThrow(AppRequestError);
    expect(() => assertForecastPayload({ city: { name: 'Kyiv' }, list: [] })).toThrow(
      AppRequestError,
    );
    expect(() =>
      assertForecastPayload({
        city: { name: 'Kyiv', country: 'UA', timezone: 0, coord: { lat: 0, lon: 0 } },
        list: [{ main: { temp: 1 } }],
      }),
    ).toThrow(AppRequestError);
  });

  it('keeps a forecast slot that omits optional measurements', () => {
    expect(
      assertForecastPayload({
        city: { name: 'Kyiv', country: 'UA', timezone: 0, coord: { lat: 50, lon: 30 } },
        list: [{ dt: 1_700_000_000, main: { temp: 4 } }],
      }).list,
    ).toEqual([{ dt: 1_700_000_000, main: { temp: 4 } }]);
  });
});
