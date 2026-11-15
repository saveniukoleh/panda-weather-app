<script setup lang="ts">
import AppButton from './AppButton.vue';

defineProps<{
  message: string;
  retryLabel?: string;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="error-message" role="alert">
    <p>{{ message }}</p>
    <AppButton v-if="retryLabel" variant="secondary" @click="emit('retry')">
      {{ retryLabel }}
    </AppButton>
  </div>
</template>

<style scoped>
.error-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  background: var(--color-danger-surface);
  color: var(--color-danger);
}

.error-message p {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: var(--font-size-sm);
}
</style>
