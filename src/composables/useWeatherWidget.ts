import { onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { AppRequestError, isAbortError } from '../services/api/errors';
import { weatherService } from '../services/weather/weatherService';
import type { AppError, WeatherLanguage } from '../types/api';
import type { CityLocation } from '../types/city';
import type { WeatherForecast } from '../types/weather';

export interface WeatherWidgetController {
  location: Ref<CityLocation | null>;
  forecast: Ref<WeatherForecast | null>;
  loading: Ref<boolean>;
  error: Ref<AppError | null>;
  selectCity: (location: CityLocation) => void;
  clearCity: () => void;
  reload: () => void;
}

/**
 * Runtime state for one weather widget.
 * Each call has its own city, forecast, loading flag, error, and request.
 * The dashboard collection remains a later phase and is not stored here.
 */
export function useWeatherWidget(
  locale: MaybeRefOrGetter<WeatherLanguage> = 'en',
): WeatherWidgetController {
  const location = ref<CityLocation | null>(null);
  const forecast = ref<WeatherForecast | null>(null);
  const loading = ref(false);
  const error = ref<AppError | null>(null);
  let requestId = 0;
  let controller: AbortController | undefined;

  function invalidate(): number {
    requestId += 1;
    controller?.abort();
    controller = undefined;
    return requestId;
  }

  function selectCity(next: CityLocation): void {
    const current = location.value;
    if (
      current &&
      current.lat === next.lat &&
      current.lon === next.lon &&
      error.value === null &&
      (loading.value || forecast.value !== null)
    ) {
      return;
    }

    location.value = next;
    void requestWeather(next);
  }

  function clearCity(): void {
    invalidate();
    location.value = null;
    forecast.value = null;
    error.value = null;
    loading.value = false;
  }

  function reload(): void {
    if (location.value === null) return;
    void requestWeather(location.value);
  }

  async function requestWeather(city: CityLocation): Promise<void> {
    const generation = invalidate();
    const nextController = new AbortController();
    controller = nextController;
    loading.value = true;
    error.value = null;
    forecast.value = null;

    try {
      const result = await weatherService.load({
        location: city,
        locale: toValue(locale),
        signal: nextController.signal,
      });
      if (generation !== requestId) return;
      forecast.value = result;
    } catch (caught) {
      if (generation !== requestId || isAbortError(caught)) return;
      forecast.value = null;
      error.value = toAppError(caught);
    } finally {
      if (generation === requestId) loading.value = false;
    }
  }

  watch(
    () => toValue(locale),
    () => {
      if (location.value) void requestWeather(location.value);
    },
    { flush: 'sync' },
  );

  onScopeDispose(() => {
    invalidate();
  });

  return { location, forecast, loading, error, selectCity, clearCity, reload };
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppRequestError) {
    return { code: error.code, message: error.message };
  }
  return { code: 'unknown', message: new AppRequestError('unknown').message };
}
