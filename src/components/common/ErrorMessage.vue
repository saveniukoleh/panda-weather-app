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
  gap: 0.5rem;
}

.error-message p {
  margin: 0;
}
</style>
