import { onScopeDispose, ref, watch, type Ref } from 'vue';
import { AppRequestError, isAbortError } from '../services/api/errors';
import { geocodingService } from '../services/weather/geocodingService';
import type { AppError } from '../types/api';
import type { CityLocation } from '../types/city';

export const CITY_SEARCH_DEBOUNCE_MS = 300;
export const CITY_SEARCH_MIN_QUERY_LENGTH = 2;

export interface CitySearchOptions {
  limit?: number;
  debounceMs?: number;
}

export interface CitySearch {
  query: Ref<string>;
  suggestions: Ref<CityLocation[]>;
  loading: Ref<boolean>;
  error: Ref<AppError | null>;
  selected: Ref<CityLocation | null>;
  select: (location: CityLocation) => CityLocation;
  reset: () => void;
}

export function useCitySearch(options: CitySearchOptions = {}): CitySearch {
  const debounceMs = options.debounceMs ?? CITY_SEARCH_DEBOUNCE_MS;
  const query = ref('');
  const suggestions = ref<CityLocation[]>([]);
  const loading = ref(false);
  const error = ref<AppError | null>(null);
  const selected = ref<CityLocation | null>(null);
  let selectedLabel: string | null = null;
  let requestId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  function invalidate(): void {
    requestId += 1;
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    controller?.abort();
    controller = undefined;
  }

  function schedule(value: string): void {
    invalidate();
    loading.value = false;
    suggestions.value = [];
    error.value = null;

    const trimmed = value.trim();
    if (trimmed.length < CITY_SEARCH_MIN_QUERY_LENGTH) return;

    timer = setTimeout(() => {
      timer = undefined;
      void runSearch(trimmed);
    }, debounceMs);
  }

  async function runSearch(value: string): Promise<void> {
    const generation = requestId;
    const nextController = new AbortController();
    controller = nextController;
    loading.value = true;
    error.value = null;

    try {
      const results = await geocodingService.search({
        query: value,
        limit: options.limit,
        signal: nextController.signal,
      });
      if (generation !== requestId) return;
      suggestions.value = results;
    } catch (caught) {
      if (generation !== requestId || isAbortError(caught)) return;
      suggestions.value = [];
      error.value = toAppError(caught);
    } finally {
      if (generation === requestId) loading.value = false;
    }
  }

  function select(location: CityLocation): CityLocation {
    invalidate();
    loading.value = false;
    error.value = null;
    suggestions.value = [];
    selected.value = location;
    selectedLabel = location.name;
    query.value = location.name;
    return location;
  }

  function reset(): void {
    invalidate();
    selectedLabel = null;
    selected.value = null;
    suggestions.value = [];
    error.value = null;
    loading.value = false;
    query.value = '';
  }

  watch(
    query,
    (value) => {
      if (selectedLabel !== null && value === selectedLabel) return;
      selectedLabel = null;
      selected.value = null;
      schedule(value);
    },
    { flush: 'sync' },
  );

  onScopeDispose(() => {
    invalidate();
  });

  return { query, suggestions, loading, error, selected, select, reset };
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppRequestError) {
    return { code: error.code, message: error.message };
  }
  return { code: 'unknown', message: new AppRequestError('unknown').message };
}
