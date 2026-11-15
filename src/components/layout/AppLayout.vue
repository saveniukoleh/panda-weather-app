<script setup lang="ts">
import type { AppTab } from '../../types/navigation';
import AppHeader from './AppHeader.vue';
import AppNav from './AppNav.vue';

defineProps<{
  activeTab: AppTab;
}>();

const emit = defineEmits<{
  changeTab: [tab: AppTab];
}>();
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <AppNav :active-tab="activeTab" @change-tab="emit('changeTab', $event)" />
    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-width: 0;
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout__main {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  padding: var(--space-5);
}

@media (max-width: 768px) {
  .app-layout__main {
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .app-layout__main {
    padding: var(--space-3);
  }
}
</style>
