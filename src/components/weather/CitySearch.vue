<script setup lang="ts">
import AppButton from '../common/AppButton.vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import LoadingIndicator from '../common/LoadingIndicator.vue';
import type { AppError } from '../../types/api';
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
    <label :for="inputId">City</label>
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
    <LoadingIndicator v-if="loading" label="Searching" />
    <ErrorMessage v-if="error" :message="error.message" />
    <ul
      v-show="suggestions.length > 0"
      :id="`${inputId}-list`"
      class="city-search__suggestions"
      role="listbox"
      aria-label="City suggestions"
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
  gap: 0.5rem;
}

.city-search input {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ccc;
}

.city-search__suggestions {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
