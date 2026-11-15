<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from '../common/AppButton.vue';
import ConfirmModal from '../common/ConfirmModal.vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import LoadingIndicator from '../common/LoadingIndicator.vue';
import { useCitySearch } from '../../composables/useCitySearch';
import { useWeatherWidget } from '../../composables/useWeatherWidget';
import { toWeatherChartDatasets } from '../../services/weather/normalizeWeather';
import { useFavoritesStore } from '../../stores/favoritesStore';
import type { AppErrorCode, LocaleCode } from '../../types/api';
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
    locale?: LocaleCode;
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

const { t } = useI18n();
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

const favorites = useFavoritesStore();
const favoritesLimitOpen = ref(false);

const isFavorite = computed(() => {
  const city = forecast.value?.location;
  return city !== undefined && favorites.isFavorite(city);
});

function toggleFavorite(): void {
  const city = forecast.value?.location;
  if (!city) return;
  if (favorites.isFavorite(city)) {
    favorites.remove(city);
    return;
  }
  if (!favorites.add(city)) favoritesLimitOpen.value = true;
}

function closeFavoritesLimit(): void {
  favoritesLimitOpen.value = false;
}

function errorText(code: AppErrorCode): string {
  return t(`errors.${code}`);
}
</script>

<template>
  <section class="weather-widget" :aria-label="$t('weather.label')" :aria-busy="weatherLoading">
    <CitySearch
      v-if="searchable"
      v-model:query="query"
      :input-id="searchInputId"
      :suggestions="suggestions"
      :loading="searchLoading"
      :error="searchError"
      @select="onSelect"
    />
    <LoadingIndicator v-if="weatherLoading" :label="$t('weather.loading')" />
    <ErrorMessage
      v-else-if="weatherError"
      :message="errorText(weatherError.code)"
      :retry-label="$t('weather.retry')"
      @retry="reload"
    />
    <template v-else-if="forecast">
      <AppButton
        :variant="isFavorite ? 'primary' : 'secondary'"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? $t('weather.removeFavorite') : $t('weather.addFavorite')"
        @click="toggleFavorite"
      >
        {{ isFavorite ? $t('weather.favorited') : $t('weather.favorite') }}
      </AppButton>
      <div class="forecast-range" role="group" :aria-label="$t('weather.range')">
        <AppButton
          :variant="forecastRange === 'day' ? 'primary' : 'secondary'"
          :aria-pressed="forecastRange === 'day'"
          @click="forecastRange = 'day'"
        >
          {{ $t('weather.day') }}
        </AppButton>
        <AppButton
          :variant="forecastRange === 'fiveDays' ? 'primary' : 'secondary'"
          :aria-pressed="forecastRange === 'fiveDays'"
          @click="forecastRange = 'fiveDays'"
        >
          {{ $t('weather.fiveDays') }}
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
    <ConfirmModal
      :open="favoritesLimitOpen"
      :title="$t('weather.limitTitle')"
      :message="$t('weather.limitMessage')"
      :confirm-label="$t('weather.ok')"
      :cancel-label="$t('weather.close')"
      @confirm="closeFavoritesLimit"
      @cancel="closeFavoritesLimit"
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
