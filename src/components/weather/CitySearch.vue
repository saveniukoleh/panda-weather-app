<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AppButton from '../common/AppButton.vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import LoadingIndicator from '../common/LoadingIndicator.vue';
import type { AppError, AppErrorCode } from '../../types/api';
import type { CityLocation } from '../../types/city';

defineProps<{
  inputId: string;
  query: string;
  suggestions: CityLocation[];
  loading: boolean;
  error: AppError | null;
}>();

const emit = defineEmits<{
  'update:query': [query: string];
  select: [location: CityLocation];
}>();

const { t } = useI18n();

function errorText(code: AppErrorCode): string {
  return t(`errors.${code}`);
}

function onInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  emit('update:query', target.value);
}

function cityLabel(city: CityLocation): string {
  const region = city.state ? `${city.state}, ${city.country}` : city.country;
  return `${city.name}, ${region}`;
}
</script>

<template>
  <div class="city-search">
    <label :for="inputId">{{ $t('search.city') }}</label>
    <input
      :id="inputId"
      type="search"
      :value="query"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="suggestions.length > 0"
      :aria-controls="`${inputId}-list`"
      @input="onInput"
    />
    <LoadingIndicator v-if="loading" :label="$t('search.searching')" />
    <ErrorMessage v-if="error" :message="errorText(error.code)" />
    <ul
      v-show="suggestions.length > 0"
      :id="`${inputId}-list`"
      class="city-search__suggestions"
      role="listbox"
      :aria-label="$t('search.suggestions')"
    >
      <li v-for="city in suggestions" :key="`${city.lat}:${city.lon}`" role="presentation">
        <AppButton
          type="button"
          role="option"
          :data-lat="city.lat"
          :data-lon="city.lon"
          @click="emit('select', city)"
        >
          {{ cityLabel(city) }}
        </AppButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.city-search {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  width: 100%;
}

.city-search label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.city-search input {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: var(--control-height);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color var(--duration-fast);
}

.city-search input:hover {
  border-color: var(--color-border-strong);
}

.city-search input:focus-visible {
  border-color: var(--color-accent);
}

.city-search__suggestions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-1);
  width: 100%;
  max-width: 100%;
  max-height: min(16rem, 50vh);
  margin: 0;
  overflow-y: auto;
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-md);
  list-style: none;
}

.city-search__suggestions :deep(.app-button) {
  justify-content: flex-start;
  width: 100%;
}
</style>
