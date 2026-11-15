import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CityLocation } from '../types/city';
import { MAX_FAVORITES, useFavoritesStore } from './favoritesStore';

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
    setActivePinia(createPinia());
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
