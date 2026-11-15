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
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.app-button--primary {
  border-color: var(--color-border-strong);
  background: var(--color-border-strong);
  color: var(--color-on-strong);
}

.app-button--danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.app-button__status {
  font-size: 0.85em;
}
</style>
