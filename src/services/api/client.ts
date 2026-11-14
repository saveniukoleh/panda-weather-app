import type { GeocodingQuery, WeatherQuery } from '../../types/api';
import { getApiBaseUrl } from './config';
import { AppRequestError, errorFromHttpStatus, isAbortError } from './errors';
import {
  assertCoordinates,
  assertCurrentWeatherPayload,
  assertForecastPayload,
  assertGeocodingLimit,
  assertGeocodingPayload,
  assertGeocodingQuery,
  assertWeatherLanguage,
  type CurrentWeatherPayload,
  type ForecastPayload,
  type GeocodingPlace,
} from './validate';

export async function requestGeocoding(
  query: GeocodingQuery,
  signal?: AbortSignal,
): Promise<GeocodingPlace[]> {
  const q = assertGeocodingQuery(query.q);
  const limit = assertGeocodingLimit(query.limit);
  const body = await apiGet('geocoding', { q, limit: String(limit) }, signal);
  return assertGeocodingPayload(body);
}

export async function requestCurrentWeather(
  query: WeatherQuery,
  signal?: AbortSignal,
): Promise<CurrentWeatherPayload> {
  const body = await apiGet('weather', weatherParams(query), signal);
  return assertCurrentWeatherPayload(body);
}

export async function requestForecast(
  query: WeatherQuery,
  signal?: AbortSignal,
): Promise<ForecastPayload> {
  const body = await apiGet('forecast', weatherParams(query), signal);
  return assertForecastPayload(body);
}

function weatherParams(query: WeatherQuery): Record<string, string> {
  assertCoordinates(query.lat, query.lon);
  const lang = assertWeatherLanguage(query.lang);
  const params: Record<string, string> = {
    lat: String(query.lat),
    lon: String(query.lon),
  };
  if (lang) params.lang = lang;
  return params;
}

async function apiGet(
  path: string,
  query: Record<string, string>,
  signal?: AbortSignal,
): Promise<unknown> {
  const url = new URL(path, `${getApiBaseUrl()}/`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new AppRequestError('network');
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new AppRequestError('network');
  }

  const parsed = parseJson(text);
  if (!response.ok) {
    throw errorFromHttpStatus(response.status, parsed.ok ? parsed.value : null);
  }
  if (!parsed.ok) throw new AppRequestError('invalid_response');
  return parsed.value;
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  if (text.trim() === '') return { ok: false };
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}
