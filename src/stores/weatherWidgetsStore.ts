import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const MAX_DASHBOARD_WIDGETS = 5;

export interface DashboardWidget {
  id: string;
}

function createWidgetId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `widget-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Dashboard collection only. Forecast, search, loading, and errors stay in each
 * WeatherWidget instance so widgets do not share request state.
 */
export const useWeatherWidgetsStore = defineStore('weatherWidgets', () => {
  const widgets = ref<DashboardWidget[]>([{ id: createWidgetId() }]);
  const pendingRemovalId = ref<string | null>(null);

  const canAdd = computed(() => widgets.value.length < MAX_DASHBOARD_WIDGETS);
  const canRemove = computed(() => widgets.value.length > 1);

  function addWidget(): void {
    if (!canAdd.value) return;
    widgets.value = [...widgets.value, { id: createWidgetId() }];
  }

  function askRemove(id: string): void {
    if (!canRemove.value) return;
    if (!widgets.value.some((widget) => widget.id === id)) return;
    pendingRemovalId.value = id;
  }

  function cancelRemove(): void {
    pendingRemovalId.value = null;
  }

  function confirmRemove(): void {
    const id = pendingRemovalId.value;
    pendingRemovalId.value = null;
    if (id === null || widgets.value.length <= 1) return;
    widgets.value = widgets.value.filter((widget) => widget.id !== id);
  }

  return {
    widgets,
    pendingRemovalId,
    canAdd,
    canRemove,
    addWidget,
    askRemove,
    cancelRemove,
    confirmRemove,
  };
});
