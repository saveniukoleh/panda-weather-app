<script setup lang="ts">
import { onScopeDispose, ref } from 'vue';
import { storeToRefs } from 'pinia';
import AppButton from '../components/common/AppButton.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import WeatherWidget from '../components/weather/WeatherWidget.vue';
import { ipLocationService } from '../services/location/ipLocationService';
import { useSettingsStore } from '../stores/settingsStore';
import { useWeatherWidgetsStore } from '../stores/weatherWidgetsStore';
import type { CityLocation } from '../types/city';

const store = useWeatherWidgetsStore();
const { widgets, pendingRemovalId, canAdd, canRemove } = storeToRefs(store);
const { locale } = storeToRefs(useSettingsStore());
const initialWidgetId = widgets.value[0]?.id ?? null;
const detectedCity = ref<CityLocation | null>(null);
const locationRequest = new AbortController();

void ipLocationService.detect(locationRequest.signal).then((city) => {
  if (city) detectedCity.value = city;
});

onScopeDispose(() => {
  locationRequest.abort();
});

function initialLocationFor(id: string): CityLocation | null {
  return id === initialWidgetId ? detectedCity.value : null;
}
</script>

<template>
  <section class="weather-dashboard" :aria-label="$t('dashboard.label')">
    <div class="weather-dashboard__toolbar">
      <h2>{{ $t('dashboard.title') }}</h2>
      <AppButton variant="primary" :disabled="!canAdd" @click="store.addWidget()">
        {{ $t('dashboard.addWidget') }}
      </AppButton>
    </div>
    <p v-if="!canAdd" class="weather-dashboard__limit">{{ $t('dashboard.widgetLimit') }}</p>
    <ul class="weather-dashboard__widgets">
      <li v-for="widget in widgets" :key="widget.id" class="weather-dashboard__widget">
        <AppButton v-if="canRemove" variant="danger" @click="store.askRemove(widget.id)">
          {{ $t('dashboard.remove') }}
        </AppButton>
        <WeatherWidget
          :id="widget.id"
          :locale="locale"
          :initial-location="initialLocationFor(widget.id)"
        />
      </li>
    </ul>
    <ConfirmModal
      :open="pendingRemovalId !== null"
      :title="$t('dashboard.removeTitle')"
      :message="$t('dashboard.removeMessage')"
      :confirm-label="$t('dashboard.removeConfirm')"
      :cancel-label="$t('dashboard.cancel')"
      @confirm="store.confirmRemove()"
      @cancel="store.cancelRemove()"
    />
  </section>
</template>

<style scoped>
.weather-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
  max-width: 100%;
}

.weather-dashboard__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  min-width: 0;
}

.weather-dashboard__toolbar h2,
.weather-dashboard__limit {
  margin: 0;
}

.weather-dashboard__toolbar h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.weather-dashboard__limit {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.weather-dashboard__widgets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.weather-dashboard__widget {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  min-width: 0;
  max-width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 1024px) {
  .weather-dashboard__widgets {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .weather-dashboard__widget {
    padding: var(--space-3);
  }
}

@media (max-width: 640px) {
  .weather-dashboard__widgets {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
