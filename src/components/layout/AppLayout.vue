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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout__main {
  flex: 1;
  padding: 1.25rem;
}
</style>
