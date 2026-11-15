<script setup lang="ts">
import { storeToRefs } from 'pinia';
import EmptyState from '../components/common/EmptyState.vue';
import WeatherWidget from '../components/weather/WeatherWidget.vue';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { CityLocation } from '../types/city';

const store = useFavoritesStore();
const { cities } = storeToRefs(store);
const { locale } = storeToRefs(useSettingsStore());

function cityKey(city: CityLocation): string {
  return `${city.lat},${city.lon}`;
}
</script>

<template>
  <section class="favorites" :aria-label="$t('favorites.label')">
    <h2>{{ $t('favorites.title') }}</h2>
    <EmptyState
      v-if="cities.length === 0"
      :title="$t('favorites.emptyTitle')"
      :description="$t('favorites.emptyDescription')"
    />
    <ul v-else class="favorites__list">
      <li v-for="city in cities" :key="cityKey(city)" class="favorites__item">
        <WeatherWidget :id="cityKey(city)" :locale="locale" :searchable="false" :location="city" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.favorites {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
  max-width: 100%;
}

.favorites h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.favorites__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.favorites__item {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 1024px) {
  .favorites__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .favorites__item {
    padding: var(--space-3);
  }
}

@media (max-width: 640px) {
  .favorites__list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
