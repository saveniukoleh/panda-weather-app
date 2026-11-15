<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  label?: string;
}>();

const { t } = useI18n();
const text = computed(() => props.label ?? t('loading.default'));
</script>

<template>
  <p class="loading-indicator" role="status" aria-live="polite">
    {{ text }}
  </p>
</template>

<style scoped>
.loading-indicator {
  margin: 0;
}
</style>
