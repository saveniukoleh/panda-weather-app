<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger';
    type?: 'button' | 'submit';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: 'secondary',
    type: 'button',
    disabled: false,
    loading: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

function onClick(event: MouseEvent): void {
  emit('click', event);
}
</script>

<template>
  <button
    class="app-button"
    :class="`app-button--${variant}`"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="onClick"
  >
    <span v-if="loading" class="app-button__status">Loading</span>
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  max-width: 100%;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  white-space: normal;
  text-align: center;
  cursor: pointer;
  transition:
    background-color var(--duration-fast),
    border-color var(--duration-fast),
    box-shadow var(--duration-fast),
    color var(--duration-fast);
}

.app-button:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background: var(--color-bg-secondary);
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.app-button--primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

.app-button--primary:hover:not(:disabled) {
  border-color: var(--color-accent-hover);
  background: var(--color-accent-hover);
  color: var(--color-accent-contrast);
}

.app-button--danger {
  border-color: var(--color-danger);
  background: var(--color-danger-surface);
  color: var(--color-danger);
}

.app-button--danger:hover:not(:disabled) {
  border-color: var(--color-danger);
  background: var(--color-danger-surface);
  color: var(--color-danger);
  box-shadow: inset 0 0 0 1px var(--color-danger);
}

.app-button__status {
  font-size: var(--font-size-xs);
}
</style>
