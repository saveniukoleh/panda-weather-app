import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { CityLocation } from '../types/city';

export const MAX_FAVORITES = 5;
export const FAVORITES_STORAGE_KEY = 'panda-weather.favorites';

function sameCity(left: CityLocation, right: CityLocation): boolean {
  return left.lat === right.lat && left.lon === right.lon;
}

function storageOrNull(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      return null;
    }
    return storage;
  } catch {
    return null;
  }
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function cityFromStored(value: unknown): CityLocation | null {
  if (typeof value !== 'object' || value === null) return null;
  const entry = value as Record<string, unknown>;
  if (!nonEmptyString(entry.name) || !nonEmptyString(entry.country)) return null;
  if (typeof entry.lat !== 'number' || !Number.isFinite(entry.lat)) return null;
  if (typeof entry.lon !== 'number' || !Number.isFinite(entry.lon)) return null;
  if (entry.state !== undefined && !nonEmptyString(entry.state)) return null;

  const city: CityLocation = {
    name: entry.name.trim(),
    country: entry.country.trim(),
    lat: entry.lat,
    lon: entry.lon,
  };
  if (entry.state !== undefined && nonEmptyString(entry.state)) city.state = entry.state.trim();
  return city;
}

function parseStoredCities(raw: string): CityLocation[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const cities: CityLocation[] = [];
  for (const entry of parsed) {
    const city = cityFromStored(entry);
    if (city === null || cities.some((saved) => sameCity(saved, city))) continue;
    cities.push(city);
    if (cities.length === MAX_FAVORITES) break;
  }
  return cities;
}

function storedCity(city: CityLocation): CityLocation {
  const stored: CityLocation = {
    name: city.name,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  };
  if (city.state !== undefined) stored.state = city.state;
  return stored;
}

function persistCities(cities: CityLocation[]): void {
  const storage = storageOrNull();
  if (storage === null) return;
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(cities.map(storedCity)));
  } catch {
    // The in-memory list stays usable when storage rejects the write.
  }
}

function loadCities(): CityLocation[] {
  const storage = storageOrNull();
  if (storage === null) return [];
  try {
    const raw = storage.getItem(FAVORITES_STORAGE_KEY);
    if (raw === null) return [];
    const cities = parseStoredCities(raw);
    if (JSON.stringify(cities) !== raw) persistCities(cities);
    return cities;
  } catch {
    return [];
  }
}

/**
 * Saved cities only. Dashboard widgets and their forecasts stay in
 * `weatherWidgetsStore` and each `WeatherWidget`.
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const cities = ref<CityLocation[]>(loadCities());

  watch(
    cities,
    (value) => {
      persistCities(value);
    },
    { flush: 'sync' },
  );

  const hasReachedLimit = computed(() => cities.value.length >= MAX_FAVORITES);

  function isFavorite(city: CityLocation): boolean {
    return cities.value.some((entry) => sameCity(entry, city));
  }

  function add(city: CityLocation): boolean {
    if (isFavorite(city) || hasReachedLimit.value) return false;
    cities.value = [...cities.value, { ...city }];
    return true;
  }

  function remove(city: CityLocation): void {
    cities.value = cities.value.filter((entry) => !sameCity(entry, city));
  }

  return {
    cities,
    hasReachedLimit,
    isFavorite,
    add,
    remove,
  };
});
