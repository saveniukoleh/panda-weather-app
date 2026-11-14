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
  gap: 0.5rem;
}

.empty-state h3,
.empty-state p {
  margin: 0;
}
</style>
