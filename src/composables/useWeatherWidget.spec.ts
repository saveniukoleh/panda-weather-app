import { effectScope, ref, type MaybeRefOrGetter } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRequestError } from '../services/api/errors';
import { weatherService } from '../services/weather/weatherService';
import type { WeatherLanguage } from '../types/api';
import type { CityLocation } from '../types/city';
import type { WeatherForecast } from '../types/weather';
import { useWeatherWidget } from './useWeatherWidget';

vi.mock('../services/weather/weatherService', () => ({
  weatherService: {
    load: vi.fn(),
  },
}));

const load = vi.mocked(weatherService.load);

const kyiv: CityLocation = {
  name: 'Kyiv',
  country: 'UA',
  state: 'Kyiv City',
  lat: 50.45,
  lon: 30.52,
};

const lviv: CityLocation = {
  name: 'Lviv',
  country: 'UA',
  lat: 49.84,
  lon: 24.03,
};

function forecastFor(location: CityLocation, temperatureC: number): WeatherForecast {
  return {
    location,
    timezoneOffsetSeconds: 7200,
    current: {
      temperatureC,
      feelsLikeC: null,
      humidity: null,
      windSpeed: null,
      pressure: null,
      condition: { description: 'clear sky', icon: '01d' },
    },
    entries: [],
    daily: [],
  };
}

const kyivForecast = forecastFor(kyiv, 6);
const lvivForecast = forecastFor(lviv, 11);

function setup(locale?: MaybeRefOrGetter<WeatherLanguage>) {
  const scope = effectScope();
  const api = scope.run(() =>
    locale === undefined ? useWeatherWidget() : useWeatherWidget(locale),
  );
  if (!api) throw new Error('Weather widget composable did not start');
  return { scope, api };
}

describe('useWeatherWidget', () => {
  afterEach(() => {
    load.mockReset();
  });

  it('loads the selected city with the locale and abort signal', async () => {
    load.mockResolvedValue(kyivForecast);
    const { scope, api } = setup('uk');

    api.selectCity(kyiv);
    expect(api.location.value).toEqual(kyiv);
    expect(api.loading.value).toBe(true);
    expect(api.error.value).toBeNull();
    expect(api.forecast.value).toBeNull();

    await flushPromises();
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith({
      location: kyiv,
      locale: 'uk',
      signal: expect.any(AbortSignal),
    });
    expect(api.loading.value).toBe(false);
    expect(api.error.value).toBeNull();
    expect(api.forecast.value).toEqual(kyivForecast);
    scope.stop();
  });

  it('does not request the same city again until it fails or is reloaded', async () => {
    load.mockResolvedValue(kyivForecast);
    const { scope, api } = setup();

    api.selectCity(kyiv);
    api.selectCity({ ...kyiv });
    expect(load).toHaveBeenCalledTimes(1);

    await flushPromises();
    api.selectCity({ ...kyiv, name: 'Kyiv' });
    expect(load).toHaveBeenCalledTimes(1);

    load.mockRejectedValueOnce(new AppRequestError('network'));
    api.reload();
    await flushPromises();
    expect(api.error.value?.code).toBe('network');

    load.mockResolvedValueOnce(kyivForecast);
    api.selectCity(kyiv);
    await flushPromises();
    expect(load).toHaveBeenCalledTimes(3);
    expect(api.forecast.value).toEqual(kyivForecast);
    expect(api.error.value).toBeNull();
    scope.stop();
  });

  it('stores a widget error and can retry the same city', async () => {
    load.mockRejectedValueOnce(new AppRequestError('rate_limit'));
    const { scope, api } = setup();

    api.selectCity(kyiv);
    await flushPromises();
    expect(api.loading.value).toBe(false);
    expect(api.forecast.value).toBeNull();
    expect(api.location.value).toEqual(kyiv);
    expect(api.error.value).toEqual({
      code: 'rate_limit',
      message: 'The weather service is rate limited. Try again later.',
    });

    load.mockResolvedValueOnce(kyivForecast);
    api.reload();
    expect(api.loading.value).toBe(true);
    expect(api.error.value).toBeNull();
    await flushPromises();
    expect(api.forecast.value).toEqual(kyivForecast);
    expect(api.loading.value).toBe(false);
    scope.stop();
  });

  it('maps unexpected failures to a safe unknown error', async () => {
    load.mockRejectedValueOnce(new Error('provider body sk-live-example'));
    const { scope, api } = setup();

    api.selectCity(kyiv);
    await flushPromises();
    expect(api.error.value?.code).toBe('unknown');
    expect(api.error.value?.message).toBe('The weather service is unavailable.');
    expect(api.error.value?.message).not.toContain('sk-live-example');
    expect(api.forecast.value).toBeNull();
    scope.stop();
  });

  it('does not surface an aborted request as a widget error', async () => {
    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';
    load.mockRejectedValueOnce(aborted);
    const { scope, api } = setup();

    api.selectCity(kyiv);
    await flushPromises();
    expect(api.error.value).toBeNull();
    expect(api.loading.value).toBe(false);
    expect(api.forecast.value).toBeNull();
    expect(api.location.value).toEqual(kyiv);
    scope.stop();
  });

  it('ignores an older successful response after a newer request', async () => {
    const pending: Array<(forecast: WeatherForecast) => void> = [];
    const signals: AbortSignal[] = [];
    load.mockImplementation((input) => {
      if (input.signal) signals.push(input.signal);
      return new Promise((resolve) => {
        pending.push(resolve);
      });
    });
    const { scope, api } = setup();

    api.selectCity(kyiv);
    api.selectCity(lviv);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    expect(api.location.value).toEqual(lviv);
    expect(api.loading.value).toBe(true);

    pending[1]?.(lvivForecast);
    await flushPromises();
    pending[0]?.(kyivForecast);
    await flushPromises();

    expect(api.forecast.value).toEqual(lvivForecast);
    expect(api.error.value).toBeNull();
    expect(api.loading.value).toBe(false);
    expect(api.location.value).toEqual(lviv);
    scope.stop();
  });

  it('ignores an older failure after a newer request', async () => {
    const pending: Array<{
      resolve: (forecast: WeatherForecast) => void;
      reject: (reason?: unknown) => void;
    }> = [];
    load.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          pending.push({ resolve, reject });
        }),
    );
    const { scope, api } = setup();

    api.selectCity(kyiv);
    api.selectCity(lviv);
    pending[1]?.resolve(lvivForecast);
    await flushPromises();
    pending[0]?.reject(new AppRequestError('network'));
    await flushPromises();

    expect(api.forecast.value).toEqual(lvivForecast);
    expect(api.error.value).toBeNull();
    expect(api.location.value).toEqual(lviv);
    scope.stop();
  });

  it('refetches when the locale changes and drops the previous response', async () => {
    const locale = ref<WeatherLanguage>('en');
    const pending: Array<(forecast: WeatherForecast) => void> = [];
    load.mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );
    const { scope, api } = setup(locale);

    api.selectCity(kyiv);
    locale.value = 'uk';
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[0]?.[0].locale).toBe('en');
    expect(load.mock.calls[1]?.[0].locale).toBe('uk');
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(true);
    expect(load.mock.calls[1]?.[0].signal?.aborted).toBe(false);

    pending[0]?.(kyivForecast);
    await flushPromises();
    expect(api.forecast.value).toBeNull();
    expect(api.loading.value).toBe(true);

    pending[1]?.(lvivForecast);
    await flushPromises();
    expect(api.forecast.value).toEqual(lvivForecast);
    expect(api.loading.value).toBe(false);
    scope.stop();
  });

  it('keeps two instances independent', async () => {
    load.mockImplementation((input) => {
      if (input.location.lat === lviv.lat) return Promise.reject(new AppRequestError('not_found'));
      return new Promise(() => undefined);
    });
    const first = setup('en');
    const second = setup('uk');

    first.api.selectCity(kyiv);
    second.api.selectCity(lviv);
    await flushPromises();

    expect(load.mock.calls[0]?.[0].locale).toBe('en');
    expect(load.mock.calls[1]?.[0].locale).toBe('uk');
    expect(load.mock.calls[0]?.[0].signal).not.toBe(load.mock.calls[1]?.[0].signal);
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(false);
    expect(first.api.loading.value).toBe(true);
    expect(first.api.error.value).toBeNull();
    expect(first.api.forecast.value).toBeNull();
    expect(second.api.loading.value).toBe(false);
    expect(second.api.error.value).toEqual({
      code: 'not_found',
      message: 'The requested data was not found.',
    });
    expect(second.api.forecast.value).toBeNull();
    expect(first.api.location.value).toEqual(kyiv);
    expect(second.api.location.value).toEqual(lviv);

    first.scope.stop();
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(true);
    expect(second.api.error.value?.code).toBe('not_found');
    expect(second.api.location.value).toEqual(lviv);
    second.scope.stop();
  });

  it('clears city state and ignores a response from the cancelled request', async () => {
    let resolveLoad: ((forecast: WeatherForecast) => void) | undefined;
    load.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const { scope, api } = setup();

    api.selectCity(kyiv);
    const signal = load.mock.calls[0]?.[0].signal;
    api.clearCity();
    expect(signal?.aborted).toBe(true);
    expect(api.location.value).toBeNull();
    expect(api.loading.value).toBe(false);
    expect(api.error.value).toBeNull();
    expect(api.forecast.value).toBeNull();

    resolveLoad?.(kyivForecast);
    await flushPromises();
    expect(api.forecast.value).toBeNull();
    expect(api.error.value).toBeNull();
    expect(api.loading.value).toBe(false);
    scope.stop();
  });

  it('aborts the request when the scope is disposed', () => {
    load.mockImplementation(() => new Promise(() => undefined));
    const { scope, api } = setup();

    api.selectCity(kyiv);
    const signal = load.mock.calls[0]?.[0].signal;
    scope.stop();
    expect(signal?.aborted).toBe(true);
  });
});
