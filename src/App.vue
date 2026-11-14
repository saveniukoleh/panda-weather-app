<script setup lang="ts">
import { ref } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';
import type { AppTab } from './types/navigation';
import FavoritesView from './views/FavoritesView.vue';
import WeatherView from './views/WeatherView.vue';

const activeTab = ref<AppTab>('weather');

function changeTab(tab: AppTab): void {
  activeTab.value = tab;
}
</script>

<template>
  <AppLayout :active-tab="activeTab" @change-tab="changeTab">
    <div
      id="weather-panel"
      role="tabpanel"
      aria-labelledby="tab-weather"
      :hidden="activeTab !== 'weather'"
    >
      <WeatherView />
    </div>
    <div
      id="favorites-panel"
      role="tabpanel"
      aria-labelledby="tab-favorites"
      :hidden="activeTab !== 'favorites'"
    >
      <FavoritesView />
    </div>
  </AppLayout>
</template>
