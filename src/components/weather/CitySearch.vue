<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from '../common/AppButton.vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import LoadingIndicator from '../common/LoadingIndicator.vue';
import type { AppError, AppErrorCode } from '../../types/api';
import type { CityLocation } from '../../types/city';

const props = defineProps<{
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
const activeIndex = ref(-1);
const dismissed = ref(false);
const listOpen = computed(() => props.suggestions.length > 0 && !dismissed.value);

watch(
  () => props.query,
  () => {
    dismissed.value = false;
    activeIndex.value = -1;
  },
);

watch(
  () => props.suggestions,
  () => {
    activeIndex.value = -1;
  },
);

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (!listOpen.value) return;
    event.preventDefault();
    dismissed.value = true;
    activeIndex.value = -1;
    return;
  }

  if (!(event.target instanceof HTMLInputElement) || !listOpen.value) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const last = props.suggestions.length - 1;
    activeIndex.value = activeIndex.value >= last ? 0 : activeIndex.value + 1;
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    const last = props.suggestions.length - 1;
    activeIndex.value = activeIndex.value <= 0 ? last : activeIndex.value - 1;
    return;
  }

  if (event.key === 'Enter' && activeIndex.value >= 0) {
    const city = props.suggestions[activeIndex.value];
    if (!city) return;
    event.preventDefault();
    emit('select', city);
  }
}

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
  <div class="city-search" @keydown="onKeydown">
    <label :for="inputId">{{ $t('search.city') }}</label>
    <input
      :id="inputId"
      type="search"
      :value="query"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="listOpen"
      :aria-activedescendant="activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined"
      :aria-controls="`${inputId}-list`"
      @input="onInput"
    />
    <LoadingIndicator v-if="loading" :label="$t('search.searching')" />
    <ErrorMessage v-if="error" :message="errorText(error.code)" />
    <ul
      v-show="listOpen"
      :id="`${inputId}-list`"
      class="city-search__suggestions"
      role="listbox"
      :aria-label="$t('search.suggestions')"
    >
      <li
        v-for="(city, index) in suggestions"
        :key="`${city.lat}:${city.lon}`"
        role="presentation"
      >
        <AppButton
          :id="`${inputId}-option-${index}`"
          type="button"
          role="option"
          :aria-selected="index === activeIndex"
          :class="{ 'is-active': index === activeIndex }"
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
  transition:
    background-color var(--duration-fast),
    border-color var(--duration-fast);
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

.city-search__suggestions :deep(.app-button.is-active) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>
