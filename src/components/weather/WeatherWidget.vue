<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import AppButton from '../common/AppButton.vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import LoadingIndicator from '../common/LoadingIndicator.vue';
import { useCitySearch } from '../../composables/useCitySearch';
import { useWeatherWidget } from '../../composables/useWeatherWidget';
import { toWeatherChartDatasets } from '../../services/weather/normalizeWeather';
import type { WeatherLanguage } from '../../types/api';
import type { CityLocation } from '../../types/city';
import type { DailyForecast } from '../../types/weather';
import CitySearch from './CitySearch.vue';
import TemperatureChart from './TemperatureChart.vue';
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
    /**
     * City applied once to a searchable widget that has no query or selection yet.
     * A later change does not replace a city the user already chose.
     */
    initialLocation?: CityLocation | null;
  }>(),
  {
    locale: 'en',
    searchable: true,
    location: null,
    initialLocation: null,
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

watch(
  () => props.initialLocation,
  (city) => {
    if (!props.searchable || !city) return;
    if (selected.value !== null || query.value.trim() !== '') return;
    select(city);
  },
  { flush: 'sync', immediate: true },
);

function onSelect(city: CityLocation): void {
  select(city);
}

type ForecastRange = 'day' | 'fiveDays';

const forecastRange = ref<ForecastRange>('day');

const chartDatasets = computed(() =>
  forecast.value === null ? null : toWeatherChartDatasets(forecast.value),
);

const chartPoints = computed(() => {
  if (chartDatasets.value === null) return [];
  return forecastRange.value === 'day'
    ? chartDatasets.value.currentDay
    : chartDatasets.value.dailyAverages;
});

function averageTemperature(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${Math.round(value)}°C`;
}

function conditionText(day: DailyForecast): string {
  const description = day.condition?.description.trim() ?? '';
  return description;
}

function iconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${encodeURIComponent(icon)}@2x.png`;
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
    <template v-else-if="forecast">
      <div class="forecast-range" role="group" aria-label="Forecast range">
        <AppButton
          :variant="forecastRange === 'day' ? 'primary' : 'secondary'"
          :aria-pressed="forecastRange === 'day'"
          @click="forecastRange = 'day'"
        >
          Day
        </AppButton>
        <AppButton
          :variant="forecastRange === 'fiveDays' ? 'primary' : 'secondary'"
          :aria-pressed="forecastRange === 'fiveDays'"
          @click="forecastRange = 'fiveDays'"
        >
          5 Days
        </AppButton>
      </div>
      <WeatherCard :location="forecast.location" :current="forecast.current" />
      <ul v-if="forecastRange === 'fiveDays'" class="daily-forecast">
        <li v-for="day in forecast.daily" :key="day.localDate">
          <p>{{ day.localDate }}</p>
          <p>{{ averageTemperature(day.averageTemperatureC) }}</p>
          <img
            v-if="day.condition"
            :src="iconUrl(day.condition.icon)"
            :alt="conditionText(day)"
            width="40"
            height="40"
          />
          <p v-if="conditionText(day) !== ''">{{ conditionText(day) }}</p>
        </li>
      </ul>
      <TemperatureChart :points="chartPoints" />
    </template>
  </section>
</template>

<style scoped>
.weather-widget {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.forecast-range {
  display: flex;
  gap: 0.5rem;
}

.daily-forecast {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.daily-forecast li {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.daily-forecast p {
  margin: 0;
}
</style>
