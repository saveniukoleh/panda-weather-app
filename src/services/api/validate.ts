import type { WeatherLanguage } from '../../types/api';
import { AppRequestError } from './errors';

// Keep geocoding limits aligned with worker/src/proxy.ts.
export const GEOCODING_QUERY_MAX_LENGTH = 100;
export const GEOCODING_LIMIT_DEFAULT = 5;
export const GEOCODING_LIMIT_MAX = 5;

export interface GeocodingPlace {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface WeatherConditionPayload {
  description: string;
  icon: string;
}

export interface CurrentWeatherPayload {
  name: string;
  main: {
    temp: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: WeatherConditionPayload[];
  wind?: { speed?: number };
  coord?: { lat: number; lon: number };
  timezone?: number;
  dt?: number;
}

export interface ForecastEntryPayload {
  dt: number;
  main: {
    temp: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: WeatherConditionPayload[];
  wind?: { speed?: number };
  pop?: number;
}

export interface ForecastPayload {
  city: {
    name: string;
    country: string;
    timezone: number;
    coord: { lat: number; lon: number };
  };
  list: ForecastEntryPayload[];
}

export function assertGeocodingQuery(query: string): string {
  const value = query.trim();
  if (value.length < 1 || value.length > GEOCODING_QUERY_MAX_LENGTH) {
    throw new AppRequestError('invalid_request');
  }
  if (hasControlCharacter(value)) throw new AppRequestError('invalid_request');
  return value;
}

export function assertGeocodingLimit(limit: number | undefined): number {
  const value = limit ?? GEOCODING_LIMIT_DEFAULT;
  if (!Number.isInteger(value) || value < 1 || value > GEOCODING_LIMIT_MAX) {
    throw new AppRequestError('invalid_request');
  }
  return value;
}

export function assertCoordinates(lat: number, lon: number): void {
  if (!isCoordinate(lat, -90, 90) || !isCoordinate(lon, -180, 180)) {
    throw new AppRequestError('invalid_request');
  }
}

export function assertWeatherLanguage(lang: string | undefined): WeatherLanguage | undefined {
  if (lang === undefined) return undefined;
  if (lang === 'en' || lang === 'uk') return lang;
  throw new AppRequestError('invalid_request');
}

export function assertGeocodingPayload(value: unknown): GeocodingPlace[] {
  if (!Array.isArray(value)) throw new AppRequestError('invalid_response');
  return value.map(readGeocodingPlace);
}

export function assertCurrentWeatherPayload(value: unknown): CurrentWeatherPayload {
  if (!isRecord(value) || !isNonEmptyString(value.name) || !isRecord(value.main)) {
    throw new AppRequestError('invalid_response');
  }
  if (!isFiniteNumber(value.main.temp)) throw new AppRequestError('invalid_response');

  const payload: CurrentWeatherPayload = {
    name: value.name,
    main: { temp: value.main.temp },
  };
  copyOptionalNumber(value.main, payload.main, 'feels_like');
  copyOptionalNumber(value.main, payload.main, 'humidity');
  copyOptionalNumber(value.main, payload.main, 'pressure');

  const weather = readConditions(value.weather);
  if (weather) payload.weather = weather;
  const wind = readWind(value.wind);
  if (wind) payload.wind = wind;
  const coord = readCoord(value.coord);
  if (coord) payload.coord = coord;
  if ('timezone' in value && value.timezone !== undefined) {
    if (!isFiniteNumber(value.timezone)) throw new AppRequestError('invalid_response');
    payload.timezone = value.timezone;
  }
  if ('dt' in value && value.dt !== undefined) {
    if (!isFiniteNumber(value.dt)) throw new AppRequestError('invalid_response');
    payload.dt = value.dt;
  }
  return payload;
}

export function assertForecastPayload(value: unknown): ForecastPayload {
  if (!isRecord(value) || !isRecord(value.city) || !Array.isArray(value.list)) {
    throw new AppRequestError('invalid_response');
  }
  if (!isNonEmptyString(value.city.name) || !isNonEmptyString(value.city.country)) {
    throw new AppRequestError('invalid_response');
  }
  if (!isFiniteNumber(value.city.timezone)) throw new AppRequestError('invalid_response');
  const coord = readCoord(value.city.coord);
  if (!coord) throw new AppRequestError('invalid_response');

  return {
    city: {
      name: value.city.name,
      country: value.city.country,
      timezone: value.city.timezone,
      coord,
    },
    list: value.list.map(readForecastEntry),
  };
}

function readGeocodingPlace(value: unknown): GeocodingPlace {
  if (!isRecord(value) || !isNonEmptyString(value.name) || !isNonEmptyString(value.country)) {
    throw new AppRequestError('invalid_response');
  }
  if (!isCoordinate(value.lat, -90, 90) || !isCoordinate(value.lon, -180, 180)) {
    throw new AppRequestError('invalid_response');
  }

  const place: GeocodingPlace = {
    name: value.name,
    country: value.country,
    lat: value.lat,
    lon: value.lon,
  };
  if ('state' in value && value.state !== undefined) {
    if (!isNonEmptyString(value.state)) throw new AppRequestError('invalid_response');
    place.state = value.state;
  }
  return place;
}

function readForecastEntry(value: unknown): ForecastEntryPayload {
  if (!isRecord(value) || !isFiniteNumber(value.dt) || !isRecord(value.main)) {
    throw new AppRequestError('invalid_response');
  }
  if (!isFiniteNumber(value.main.temp)) throw new AppRequestError('invalid_response');

  const entry: ForecastEntryPayload = {
    dt: value.dt,
    main: { temp: value.main.temp },
  };
  copyOptionalNumber(value.main, entry.main, 'feels_like');
  copyOptionalNumber(value.main, entry.main, 'humidity');
  copyOptionalNumber(value.main, entry.main, 'pressure');

  const weather = readConditions(value.weather);
  if (weather) entry.weather = weather;
  const wind = readWind(value.wind);
  if (wind) entry.wind = wind;
  if ('pop' in value && value.pop !== undefined) {
    if (!isFiniteNumber(value.pop)) throw new AppRequestError('invalid_response');
    entry.pop = value.pop;
  }
  return entry;
}

function readConditions(value: unknown): WeatherConditionPayload[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new AppRequestError('invalid_response');
  return value.map((item) => {
    if (!isRecord(item) || typeof item.description !== 'string' || typeof item.icon !== 'string') {
      throw new AppRequestError('invalid_response');
    }
    return { description: item.description, icon: item.icon };
  });
}

function readWind(value: unknown): { speed?: number } | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new AppRequestError('invalid_response');
  if (!('speed' in value) || value.speed === undefined) return {};
  if (!isFiniteNumber(value.speed)) throw new AppRequestError('invalid_response');
  return { speed: value.speed };
}

function readCoord(value: unknown): { lat: number; lon: number } | undefined {
  if (value === undefined) return undefined;
  if (
    !isRecord(value) ||
    !isCoordinate(value.lat, -90, 90) ||
    !isCoordinate(value.lon, -180, 180)
  ) {
    throw new AppRequestError('invalid_response');
  }
  return { lat: value.lat, lon: value.lon };
}

function copyOptionalNumber(
  source: Record<string, unknown>,
  target: { feels_like?: number; humidity?: number; pressure?: number },
  key: 'feels_like' | 'humidity' | 'pressure',
): void {
  if (!(key in source) || source[key] === undefined) return;
  if (!isFiniteNumber(source[key])) throw new AppRequestError('invalid_response');
  target[key] = source[key];
}

function isCoordinate(value: unknown, min: number, max: number): value is number {
  return isFiniteNumber(value) && value >= min && value <= max;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}
