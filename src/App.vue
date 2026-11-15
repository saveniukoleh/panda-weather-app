<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLayout from './components/layout/AppLayout.vue';
import { useSettingsStore } from './stores/settingsStore';
import type { AppTab } from './types/navigation';
import FavoritesView from './views/FavoritesView.vue';
import WeatherView from './views/WeatherView.vue';

const activeTab = ref<AppTab>('weather');
const { locale } = storeToRefs(useSettingsStore());
const { locale: i18nLocale, t } = useI18n();

watch(
  locale,
  (value) => {
    i18nLocale.value = value;
    document.documentElement.lang = value;
    document.title = t('app.title');
  },
  { immediate: true },
);

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
