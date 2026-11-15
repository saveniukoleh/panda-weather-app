import type { CityLocation } from '../../types/city';

/** Used when IP geolocation is missing, incomplete, or unreachable. */
export const FALLBACK_CITY: CityLocation = {
  name: 'London',
  country: 'GB',
  lat: 51.5074,
  lon: -0.1278,
};

const GEOJS_URL = 'https://get.geojs.io/v1/ip/geo.json';

export const ipLocationService = {
  /**
   * Approximate city from the caller IP. No API key and no browser permission.
   * Returns null when the request was aborted. Any other failure returns London.
   */
  async detect(signal?: AbortSignal): Promise<CityLocation | null> {
    try {
      const response = await fetch(GEOJS_URL, {
        method: 'GET',
        signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return FALLBACK_CITY;
      return toCity(await response.json()) ?? FALLBACK_CITY;
    } catch {
      if (signal?.aborted) return null;
      return FALLBACK_CITY;
    }
  },
};

function toCity(body: unknown): CityLocation | null {
  if (typeof body !== 'object' || body === null) return null;
  const record = body as Record<string, unknown>;
  const name = text(record.city);
  const country = text(record.country_code);
  const lat = Number(record.latitude);
  const lon = Number(record.longitude);
  if (name === '' || country === '') return null;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return null;

  const location: CityLocation = { name, country, lat, lon };
  const region = text(record.region);
  if (region !== '') location.state = region;
  return location;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
