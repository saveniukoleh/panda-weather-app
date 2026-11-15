<script setup lang="ts">
import { computed, useId, watch } from 'vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import LoadingIndicator from '../common/LoadingIndicator.vue';
import { useCitySearch } from '../../composables/useCitySearch';
import { useWeatherWidget } from '../../composables/useWeatherWidget';
import type { WeatherLanguage } from '../../types/api';
import type { CityLocation } from '../../types/city';
import CitySearch from './CitySearch.vue';
import WeatherCard from './WeatherCard.vue';

const props = withDefaults(
  defineProps<{
    /** Stable id used for the city search control. Generated when omitted. */
    id?: string;
    /** Language sent with the weather request. Defaults to English. */
    locale?: WeatherLanguage;
    /**
     * When true, the city comes from this widget's search.
     * When false, search is hidden and `location` is the selected city.
     */
    searchable?: boolean;
    /** Selected city for a non-searchable widget. Ignored while search is enabled. */
    location?: CityLocation | null;
  }>(),
  {
    locale: 'en',
    searchable: true,
    location: null,
  },
);

const generatedId = useId();
const searchInputId = computed(() => `${props.id ?? generatedId}-city`);

const {
  query,
  suggestions,
  loading: searchLoading,
  error: searchError,
  selected,
  select,
} = useCitySearch();

const {
  forecast,
  loading: weatherLoading,
  error: weatherError,
  selectCity,
  clearCity,
  reload,
} = useWeatherWidget(() => props.locale);

watch(
  selected,
  (city) => {
    if (!props.searchable) return;
    if (city) selectCity(city);
    else clearCity();
  },
  { flush: 'sync' },
);

watch(
  () => (props.searchable ? undefined : props.location),
  (city) => {
    if (props.searchable) return;
    if (city) selectCity(city);
    else clearCity();
  },
  { flush: 'sync', immediate: true },
);

function onSelect(city: CityLocation): void {
  select(city);
}
</script>

<template>
  <section class="weather-widget" aria-label="Weather" :aria-busy="weatherLoading">
    <CitySearch
      v-if="searchable"
      v-model:query="query"
      :input-id="searchInputId"
      :suggestions="suggestions"
      :loading="searchLoading"
      :error="searchError"
      @select="onSelect"
    />
    <LoadingIndicator v-if="weatherLoading" label="Loading weather" />
    <ErrorMessage
      v-else-if="weatherError"
      :message="weatherError.message"
      retry-label="Retry"
      @retry="reload"
    />
    <WeatherCard
      v-else-if="forecast"
      :location="forecast.location"
      :current="forecast.current"
    />
  </section>
</template>

<style scoped>
.weather-widget {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}
</style>
