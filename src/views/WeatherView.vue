<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '../components/common/AppButton.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import EmptyState from '../components/common/EmptyState.vue';
import ErrorMessage from '../components/common/ErrorMessage.vue';
import LoadingIndicator from '../components/common/LoadingIndicator.vue';

const isModalOpen = ref(false);
</script>

<template>
  <section>
    <h2>Weather</h2>
    <p>Weather dashboard will appear here.</p>

    <div class="shared-ui-preview">
      <h3>Shared UI preview</h3>
      <AppButton variant="primary">Primary</AppButton>
      <AppButton>Secondary</AppButton>
      <AppButton variant="danger" @click="isModalOpen = true">Open confirm</AppButton>
      <AppButton disabled>Disabled</AppButton>
      <AppButton loading>Saving</AppButton>
      <LoadingIndicator />
      <ErrorMessage message="Something went wrong." retry-label="Retry" />
      <EmptyState
        title="Nothing here yet"
        description="This is a placeholder empty state."
        action-label="Optional action"
      />
    </div>

    <ConfirmModal
      :open="isModalOpen"
      title="Confirm action"
      message="This is a reusable confirmation dialog."
      confirm-label="Confirm"
      cancel-label="Cancel"
      @confirm="isModalOpen = false"
      @cancel="isModalOpen = false"
    />
  </section>
</template>

<style scoped>
.shared-ui-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.shared-ui-preview h3 {
  margin: 0;
}
</style>
