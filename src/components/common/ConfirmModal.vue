<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, useId, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from './AppButton.vue';

const props = defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}>();

const { t } = useI18n();
const confirmText = computed(() => props.confirmLabel ?? t('dialog.confirm'));
const cancelText = computed(() => props.cancelLabel ?? t('dialog.cancel'));

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const dialog = useTemplateRef<HTMLDivElement>('dialog');
const titleId = `confirm-modal-title-${useId()}`;
const messageId = `confirm-modal-message-${useId()}`;
let restoreFocusTo: HTMLElement | null = null;

function focusableActions(): HTMLButtonElement[] {
  const root = dialog.value;
  if (!root) return [];
  return [...root.querySelectorAll('button')].filter(
    (button): button is HTMLButtonElement => !button.disabled,
  );
}

function rememberOpener(): void {
  const current = document.activeElement;
  restoreFocusTo = current instanceof HTMLElement ? current : null;
}

function returnFocus(): void {
  const target = restoreFocusTo;
  restoreFocusTo = null;
  if (target?.isConnected) target.focus();
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      returnFocus();
      return;
    }

    rememberOpener();
    await nextTick();
    const [cancelButton] = focusableActions();
    (cancelButton ?? dialog.value)?.focus();
  },
);

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('cancel');
    return;
  }

  if (event.key !== 'Tab') return;

  const actions = focusableActions();
  if (actions.length === 0) {
    event.preventDefault();
    dialog.value?.focus();
    return;
  }

  const first = actions[0];
  const last = actions[actions.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || !dialog.value?.contains(active))) {
    event.preventDefault();
    last?.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first?.focus();
  }
}

onBeforeUnmount(() => {
  if (props.open) returnFocus();
});
</script>

<template>
  <div
    v-if="open"
    class="confirm-modal__backdrop"
    @click.self="emit('cancel')"
    @keydown="onKeydown"
  >
    <div
      ref="dialog"
      class="confirm-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
      tabindex="-1"
    >
      <h2 :id="titleId">{{ title }}</h2>
      <p :id="messageId">{{ message }}</p>
      <div class="confirm-modal__actions">
        <AppButton variant="secondary" @click="emit('cancel')">
          {{ cancelText }}
        </AppButton>
        <AppButton variant="danger" @click="emit('confirm')">
          {{ confirmText }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--color-overlay);
}

.confirm-modal {
  width: 100%;
  max-width: 28rem;
  max-height: min(32rem, calc(100vh - 2 * var(--space-4)));
  padding: var(--space-5);
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
  outline: none;
}

.confirm-modal h2,
.confirm-modal p {
  margin: 0 0 var(--space-3);
}

.confirm-modal h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.confirm-modal p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.confirm-modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (max-width: 480px) {
  .confirm-modal {
    padding: var(--space-4);
  }

  .confirm-modal__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .confirm-modal__actions :deep(.app-button) {
    width: 100%;
  }
}
</style>
