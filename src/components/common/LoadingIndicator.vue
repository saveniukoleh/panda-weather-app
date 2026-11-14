<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: 'Loading',
  },
);
</script>

<template>
  <p class="loading-indicator" role="status" aria-live="polite">
    {{ label }}
  </p>
</template>

<style scoped>
.loading-indicator {
  margin: 0;
}
</style>
