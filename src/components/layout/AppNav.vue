<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue';
import type { AppTab } from '../../types/navigation';

const props = defineProps<{
  activeTab: AppTab;
}>();

const emit = defineEmits<{
  changeTab: [tab: AppTab];
}>();

const tabs: AppTab[] = ['weather', 'favorites'];
const weatherTab = useTemplateRef<HTMLButtonElement>('weatherTab');
const favoritesTab = useTemplateRef<HTMLButtonElement>('favoritesTab');

async function selectTab(tab: AppTab): Promise<void> {
  emit('changeTab', tab);
  await nextTick();
  const target = tab === 'weather' ? weatherTab.value : favoritesTab.value;
  target?.focus();
}

function onTabKeydown(event: KeyboardEvent): void {
  const currentIndex = tabs.indexOf(props.activeTab);
  let nextIndex = currentIndex;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % tabs.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = tabs.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  void selectTab(tabs[nextIndex]);
}
</script>

<template>
  <div class="app-nav" role="tablist" :aria-label="$t('nav.label')" @keydown="onTabKeydown">
    <button
      id="tab-weather"
      ref="weatherTab"
      type="button"
      role="tab"
      :aria-selected="activeTab === 'weather'"
      aria-controls="weather-panel"
      :tabindex="activeTab === 'weather' ? 0 : -1"
      @click="selectTab('weather')"
    >
      {{ $t('nav.weather') }}
    </button>
    <button
      id="tab-favorites"
      ref="favoritesTab"
      type="button"
      role="tab"
      :aria-selected="activeTab === 'favorites'"
      aria-controls="favorites-panel"
      :tabindex="activeTab === 'favorites' ? 0 : -1"
      @click="selectTab('favorites')"
    >
      {{ $t('nav.favorites') }}
    </button>
  </div>
</template>

<style scoped>
.app-nav {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-separator);
  background: var(--color-surface);
}

.app-nav button {
  min-height: var(--control-height);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition:
    background-color var(--duration-fast),
    border-color var(--duration-fast),
    color var(--duration-fast);
}

.app-nav button:hover {
  border-color: var(--color-border-strong);
  background: var(--color-bg-secondary);
}

.app-nav button[aria-selected='true'] {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.app-nav button[aria-selected='true']:hover {
  border-color: var(--color-accent-hover);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .app-nav {
    padding: var(--space-3) var(--space-4);
  }
}

@media (max-width: 480px) {
  .app-nav {
    padding: var(--space-3);
  }

  .app-nav button {
    flex: 1 1 0;
    min-width: 0;
  }
}
</style>
