<script setup lang="ts">
import { computed, nextTick, useId, useTemplateRef, watch } from 'vue';
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

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      return;
    }

    await nextTick();
    dialog.value?.focus();
  },
);

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('cancel');
  }
}
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 40%);
}

.confirm-modal {
  max-width: 28rem;
  padding: 1.25rem;
  background: #fff;
  outline: none;
}

.confirm-modal h2,
.confirm-modal p {
  margin: 0 0 0.75rem;
}

.confirm-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
