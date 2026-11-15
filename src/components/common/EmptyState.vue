<script setup lang="ts">
import AppButton from './AppButton.vue';

defineProps<{
  title: string;
  description?: string;
  actionLabel?: string;
}>();

const emit = defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="empty-state">
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <AppButton v-if="actionLabel" variant="primary" @click="emit('action')">
      {{ actionLabel }}
    </AppButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
}

.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state h3 {
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
