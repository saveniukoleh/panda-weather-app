import { effectScope } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRequestError } from '../services/api/errors';
import { geocodingService } from '../services/weather/geocodingService';
import type { CityLocation } from '../types/city';
import { useCitySearch } from './useCitySearch';

vi.mock('../services/weather/geocodingService', () => ({
  geocodingService: {
    search: vi.fn(),
  },
}));

const search = vi.mocked(geocodingService.search);

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

function setup() {
  const scope = effectScope();
  const api = scope.run(() => useCitySearch());
  if (!api) throw new Error('City search composable did not start');
  return { scope, api };
}

describe('useCitySearch', () => {
  afterEach(() => {
    search.mockReset();
    vi.useRealTimers();
  });

  it('debounces a search and skips empty or short queries', async () => {
    vi.useFakeTimers();
    search.mockResolvedValue([kyiv]);
    const { scope, api } = setup();

    api.query.value = ' ';
    await vi.advanceTimersByTimeAsync(300);
    api.query.value = 'K';
    await vi.advanceTimersByTimeAsync(300);
    expect(search).not.toHaveBeenCalled();

    api.query.value = '  Kyiv ';
    await vi.advanceTimersByTimeAsync(299);
    expect(search).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({
      query: 'Kyiv',
      limit: undefined,
      signal: expect.any(AbortSignal),
    });
    expect(api.suggestions.value).toEqual([kyiv]);
    expect(api.error.value).toBeNull();
    expect(api.loading.value).toBe(false);
    scope.stop();
  });

  it('keeps an empty provider result distinct from a failed request', async () => {
    vi.useFakeTimers();
    search.mockResolvedValueOnce([]);
    const { scope, api } = setup();

    api.query.value = 'Kyiv';
    await vi.advanceTimersByTimeAsync(300);
    expect(api.suggestions.value).toEqual([]);
    expect(api.error.value).toBeNull();

    search.mockRejectedValueOnce(new AppRequestError('network'));
    api.query.value = 'Lviv';
    await vi.advanceTimersByTimeAsync(300);
    expect(api.suggestions.value).toEqual([]);
    expect(api.error.value).toEqual({
      code: 'network',
      message: 'The weather service could not be reached.',
    });

    search.mockRejectedValueOnce(new Error('provider body sk-live-example'));
    api.query.value = 'Odesa';
    await vi.advanceTimersByTimeAsync(300);
    expect(api.error.value?.code).toBe('unknown');
    expect(api.error.value?.message).not.toContain('sk-live-example');
    scope.stop();
  });

  it('cancels the previous request and ignores a stale response', async () => {
    vi.useFakeTimers();
    const pending: Array<(locations: CityLocation[]) => void> = [];
    const signals: AbortSignal[] = [];
    search.mockImplementation((input) => {
      if (input.signal) signals.push(input.signal);
      return new Promise((resolve) => {
        pending.push(resolve);
      });
    });
    const { scope, api } = setup();

    api.query.value = 'Kyiv';
    await vi.advanceTimersByTimeAsync(300);
    api.query.value = 'Lviv';
    await vi.advanceTimersByTimeAsync(300);

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    pending[1]?.([lviv]);
    await vi.advanceTimersByTimeAsync(0);
    pending[0]?.([kyiv]);
    await vi.advanceTimersByTimeAsync(0);

    expect(api.suggestions.value).toEqual([lviv]);
    expect(api.error.value).toBeNull();
    scope.stop();
  });

  it('does not surface cancellation as an error', async () => {
    vi.useFakeTimers();
    search.mockImplementation((input) => {
      return new Promise((_resolve, reject) => {
        input.signal?.addEventListener('abort', () => {
          const aborted = new Error('The operation was aborted');
          aborted.name = 'AbortError';
          reject(aborted);
        });
      });
    });
    const { scope, api } = setup();

    api.query.value = 'Kyiv';
    await vi.advanceTimersByTimeAsync(300);
    api.query.value = 'Lviv';
    expect(api.error.value).toBeNull();
    expect(api.loading.value).toBe(false);
    scope.stop();
  });

  it('selects a city and pauses autocomplete until the query changes or reset', async () => {
    vi.useFakeTimers();
    search.mockResolvedValue([kyiv]);
    const { scope, api } = setup();

    api.query.value = 'Kyiv';
    await vi.advanceTimersByTimeAsync(300);
    expect(api.select(kyiv)).toEqual(kyiv);
    expect(api.selected.value).toEqual(kyiv);
    expect(api.query.value).toBe('Kyiv');
    expect(api.suggestions.value).toEqual([]);

    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledTimes(1);

    api.query.value = 'Lviv';
    await vi.advanceTimersByTimeAsync(300);
    expect(api.selected.value).toBeNull();
    expect(search).toHaveBeenCalledTimes(2);

    api.select(lviv);
    api.reset();
    expect(api.query.value).toBe('');
    expect(api.selected.value).toBeNull();
    expect(api.suggestions.value).toEqual([]);
    expect(api.error.value).toBeNull();
    expect(api.loading.value).toBe(false);
    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledTimes(2);
    scope.stop();
  });

  it('aborts an in-flight request when the scope is disposed', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    search.mockImplementation((input) => {
      signal = input.signal;
      return new Promise(() => undefined);
    });
    const { scope, api } = setup();

    api.query.value = 'Kyiv';
    await vi.advanceTimersByTimeAsync(300);
    scope.stop();

    expect(signal?.aborted).toBe(true);
  });
});
