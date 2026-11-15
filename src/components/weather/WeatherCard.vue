<script setup lang="ts">
import type { CityLocation } from '../../types/city';
import type { WeatherSnapshot } from '../../types/weather';

defineProps<{
  location: CityLocation;
  current: WeatherSnapshot;
}>();

const unavailable = '—';

function temperature(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return unavailable;
  return `${Math.round(value)}°C`;
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return unavailable;
  return `${Math.round(value)}%`;
}

function wind(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return unavailable;
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} m/s`;
}

function pressure(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return unavailable;
  return `${Math.round(value)} hPa`;
}

function placeName(location: CityLocation): string {
  const name = location.name.trim();
  return name === '' ? unavailable : name;
}

function placeRegion(location: CityLocation): string {
  const parts = [location.state, location.country].filter(
    (part): part is string => typeof part === 'string' && part.trim() !== '',
  );
  return parts.length > 0 ? parts.join(', ') : unavailable;
}

function conditionText(current: WeatherSnapshot): string {
  const description = current.condition?.description.trim() ?? '';
  return description === '' ? unavailable : description;
}

function iconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${encodeURIComponent(icon)}@2x.png`;
}
</script>

<template>
  <article class="weather-card">
    <header class="weather-card__place">
      <h2>{{ placeName(location) }}</h2>
      <p>{{ placeRegion(location) }}</p>
    </header>
    <div class="weather-card__current">
      <img
        v-if="current.condition"
        :src="iconUrl(current.condition.icon)"
        :alt="conditionText(current)"
        width="64"
        height="64"
      />
      <p class="weather-card__temperature">{{ temperature(current.temperatureC) }}</p>
      <p>{{ conditionText(current) }}</p>
    </div>
    <dl>
      <div>
        <dt>{{ $t('card.feelsLike') }}</dt>
        <dd>{{ temperature(current.feelsLikeC) }}</dd>
      </div>
      <div>
        <dt>{{ $t('card.humidity') }}</dt>
        <dd>{{ percent(current.humidity) }}</dd>
      </div>
      <div>
        <dt>{{ $t('card.wind') }}</dt>
        <dd>{{ wind(current.windSpeed) }}</dd>
      </div>
      <div>
        <dt>{{ $t('card.pressure') }}</dt>
        <dd>{{ pressure(current.pressure) }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.weather-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.weather-card h2,
.weather-card p {
  margin: 0;
}

.weather-card__place,
.weather-card__current {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.weather-card__current {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.weather-card__temperature {
  font-size: 1.75rem;
  line-height: 1;
}

.weather-card dl {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.25rem 1rem;
  margin: 0;
}

.weather-card dd {
  margin: 0;
}
</style>
