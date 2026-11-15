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
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #ddd;
}

.app-nav button {
  padding: 0.35rem 0.75rem;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}

.app-nav button[aria-selected='true'] {
  font-weight: 600;
  border-color: #111;
}
</style>
