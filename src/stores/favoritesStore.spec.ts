import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CityLocation } from '../types/city';
import { FAVORITES_STORAGE_KEY, MAX_FAVORITES, useFavoritesStore } from './favoritesStore';

const kyiv: CityLocation = {
  name: 'Kyiv',
  country: 'UA',
  state: 'Kyiv City',
  lat: 50.45,
  lon: 30.52,
};

function cityAt(index: number): CityLocation {
  return { name: `City ${index}`, country: 'UA', lat: index, lon: index + 0.5 };
}

describe('favoritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds and removes a city by coordinates', () => {
    const store = useFavoritesStore();

    expect(store.add(kyiv)).toBe(true);
    expect(store.cities).toEqual([kyiv]);
    expect(store.isFavorite(kyiv)).toBe(true);
    expect(store.cities[0]).not.toBe(kyiv);

    store.remove({ ...kyiv, name: 'Other name' });
    expect(store.cities).toEqual([]);
    expect(store.isFavorite(kyiv)).toBe(false);
  });

  it('ignores a duplicate coordinate pair and keeps the saved city', () => {
    const store = useFavoritesStore();
    store.add(kyiv);

    expect(store.add({ ...kyiv, name: 'Kyiv renamed' })).toBe(false);
    expect(store.cities).toEqual([kyiv]);
  });

  it('rejects a sixth city and still allows removal', () => {
    const store = useFavoritesStore();
    for (let index = 0; index < MAX_FAVORITES; index += 1) {
      expect(store.add(cityAt(index))).toBe(true);
    }

    expect(store.hasReachedLimit).toBe(true);
    const extra = cityAt(MAX_FAVORITES);
    expect(store.add(extra)).toBe(false);
    expect(store.cities).toHaveLength(MAX_FAVORITES);
    expect(store.isFavorite(extra)).toBe(false);

    store.remove(cityAt(0));
    expect(store.hasReachedLimit).toBe(false);
    expect(store.add(extra)).toBe(true);
  });
});

describe('favoritesStore persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  function storedCities(): unknown {
    return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? 'null');
  }

  it('persists city locations and restores them in a new store', () => {
    const store = useFavoritesStore();
    expect(store.add(kyiv)).toBe(true);
    store.remove(kyiv);
    expect(store.add({ ...kyiv, forecast: { temperatureC: 20 } } as CityLocation)).toBe(true);

    expect(storedCities()).toEqual([kyiv]);

    setActivePinia(createPinia());
    expect(useFavoritesStore().cities).toEqual([kyiv]);
  });

  it('drops malformed entries, duplicate coordinates, and cities past the limit', () => {
    const lviv: CityLocation = { name: 'Lviv', country: 'UA', lat: 49.84, lon: 24.03 };
    const extras = [0, 1, 2, 3].map((index) => cityAt(index));
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([
        { name: '  ', country: 'UA', lat: 1, lon: 1 },
        { ...kyiv, name: '  Kyiv  ', country: ' UA ', state: ' Kyiv City ' },
        { name: 'No country', lat: 1, lon: 2 },
        { name: 'Bad lat', country: 'UA', lat: '50', lon: 1 },
        { name: 'Bad lon', country: 'UA', lat: 1, lon: Number.POSITIVE_INFINITY },
        { name: 'Bad state', country: 'UA', lat: 2, lon: 2, state: '' },
        { name: 'Duplicate', country: 'UA', state: 'Other', lat: kyiv.lat, lon: kyiv.lon },
        lviv,
        ...extras,
        { name: 'Past limit', country: 'UA', lat: 9, lon: 9 },
      ]),
    );

    const store = useFavoritesStore();
    const accepted = [{ ...kyiv }, lviv, ...extras.slice(0, MAX_FAVORITES - 2)];

    expect(store.cities).toEqual(accepted);
    expect(store.hasReachedLimit).toBe(true);
    expect(store.isFavorite({ name: 'Past limit', country: 'UA', lat: 9, lon: 9 })).toBe(false);
    expect(storedCities()).toEqual(accepted);
  });

  it('restores an empty list when stored JSON is unreadable', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{not json');
    expect(useFavoritesStore().cities).toEqual([]);
    expect(storedCities()).toEqual([]);

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ cities: [kyiv] }));
    setActivePinia(createPinia());
    expect(useFavoritesStore().cities).toEqual([]);
    expect(storedCities()).toEqual([]);
  });

  it('keeps working when localStorage is missing or throws', () => {
    vi.stubGlobal('localStorage', undefined);
    setActivePinia(createPinia());
    const missing = useFavoritesStore();
    expect(missing.cities).toEqual([]);
    expect(missing.add(kyiv)).toBe(true);
    expect(missing.cities).toEqual([kyiv]);

    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('get denied');
      },
      setItem: () => {
        throw new Error('set denied');
      },
    });
    setActivePinia(createPinia());
    const blocked = useFavoritesStore();
    expect(blocked.cities).toEqual([]);
    expect(blocked.add(cityAt(1))).toBe(true);
    expect(blocked.cities).toEqual([cityAt(1)]);
    expect(() => blocked.remove(cityAt(1))).not.toThrow();
    expect(blocked.cities).toEqual([]);
  });
});
