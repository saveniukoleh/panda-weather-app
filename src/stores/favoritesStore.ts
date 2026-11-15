import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { CityLocation } from '../types/city';

export const MAX_FAVORITES = 5;

function sameCity(left: CityLocation, right: CityLocation): boolean {
  return left.lat === right.lat && left.lon === right.lon;
}

/**
 * Saved cities only. Dashboard widgets and their forecasts stay in
 * `weatherWidgetsStore` and each `WeatherWidget`. Persistence is Phase 6.2.
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const cities = ref<CityLocation[]>([]);

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
