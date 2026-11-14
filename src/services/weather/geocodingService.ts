import { requestGeocoding } from '../api/client';
import type { GeocodingPlace } from '../api/validate';
import type { CityLocation } from '../../types/city';

export interface GeocodingSearch {
  query: string;
  limit?: number;
  signal?: AbortSignal;
}

export const geocodingService = {
  async search(input: GeocodingSearch): Promise<CityLocation[]> {
    const places = await requestGeocoding({ q: input.query, limit: input.limit }, input.signal);
    return places.map(toCityLocation);
  },
};

function toCityLocation(place: GeocodingPlace): CityLocation {
  const location: CityLocation = {
    name: place.name,
    country: place.country,
    lat: place.lat,
    lon: place.lon,
  };
  if (place.state !== undefined) location.state = place.state;
  return location;
}
