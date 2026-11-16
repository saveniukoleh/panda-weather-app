import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestCurrentWeather, requestForecast, requestGeocoding } from './client';
import { AppRequestError } from './errors';

vi.mock('./config', () => ({
  getApiBaseUrl: () => 'https://worker.example',
}));

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api client reliability', () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('returns an empty geocoding list and does not call OpenWeatherMap', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestGeocoding({ q: 'Nowhere' })).resolves.toEqual([]);

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toBe('https://worker.example/geocoding?q=Nowhere&limit=5');
    expect(url).not.toContain('openweathermap');
    expect(url).not.toContain('appid');
  });

  it('distinguishes an empty search result from a failed request', async () => {
    fetchMock.mockImplementation((input) => {
      const query = new URL(String(input)).searchParams.get('q');
      if (query === 'Kyiv') return Promise.resolve(jsonResponse([]));
      return Promise.resolve(
        jsonResponse(
          { error: { code: 'not_found', message: 'upstream city text and appid=secret' } },
          404,
        ),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const [empty, missing] = await Promise.allSettled([
      requestGeocoding({ q: 'Kyiv' }),
      requestGeocoding({ q: 'Missing' }),
    ]);

    expect(empty).toEqual({ status: 'fulfilled', value: [] });
    expect(missing).toMatchObject({ status: 'rejected', reason: { code: 'not_found' } });
    if (missing.status === 'rejected') {
      expect(missing.reason).toBeInstanceOf(AppRequestError);
      expect((missing.reason as AppRequestError).message).not.toContain('secret');
      expect((missing.reason as AppRequestError).message).not.toContain('upstream');
    }
  });

  it('maps credential and rate-limit responses without provider text', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: { code: 'unauthorized', message: 'Invalid API key sk-live' } }, 401),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestCurrentWeather({ lat: 50.45, lon: 30.52 })).rejects.toMatchObject({
      code: 'unauthorized',
    });

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'quota for sk-live' }, 429));
    const limited = await requestForecast({ lat: 50.45, lon: 30.52, lang: 'uk' }).then(
      () => null,
      (error: unknown) => error,
    );
    expect(limited).toMatchObject({ code: 'rate_limit' });
    expect(limited).toBeInstanceOf(AppRequestError);
    if (limited instanceof AppRequestError) {
      expect(limited.message).not.toContain('sk-live');
      expect(limited.message).not.toContain('quota');
    }

    fetchMock.mockResolvedValueOnce(new Response('quota token=sk-live', { status: 429 }));
    const raw = await requestForecast({ lat: 50.45, lon: 30.52 }).then(
      () => null,
      (error: unknown) => error,
    );
    expect(raw).toMatchObject({ code: 'rate_limit' });
    if (raw instanceof AppRequestError) {
      expect(raw.message).not.toContain('sk-live');
      expect(raw.message).not.toContain('quota');
    }
  });

  it('keeps cancellation separate from a network failure', async () => {
    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';
    fetchMock.mockRejectedValueOnce(aborted);
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestGeocoding({ q: 'Kyiv' })).rejects.toBe(aborted);

    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch https://worker.example'));
    const failure = await requestGeocoding({ q: 'Kyiv' }).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toMatchObject({ name: 'AppRequestError', code: 'network' });
    if (failure instanceof AppRequestError) {
      expect(failure.message).not.toContain('worker.example');
    }
  });

  it('uses the worker network code and leaves other server failures unknown', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: { code: 'network', message: 'dial appid=secret' } }, 502),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(requestForecast({ lat: 1, lon: 2 })).rejects.toMatchObject({ code: 'network' });

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: 'unknown' } }, 502));
    await expect(requestForecast({ lat: 1, lon: 2 })).rejects.toMatchObject({ code: 'unknown' });
  });

  it('rejects an incomplete success payload and accepts missing optional fields', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ name: 'Kyiv' }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(requestCurrentWeather({ lat: 50, lon: 30 })).rejects.toMatchObject({
      code: 'invalid_response',
    });

    fetchMock.mockResolvedValueOnce(jsonResponse({ name: 'Kyiv', main: { temp: 6 } }));
    await expect(requestCurrentWeather({ lat: 50, lon: 30 })).resolves.toEqual({
      name: 'Kyiv',
      main: { temp: 6 },
    });

    fetchMock.mockResolvedValueOnce(jsonResponse({ city: { name: 'Kyiv' }, list: [] }));
    await expect(requestForecast({ lat: 50, lon: 30 })).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  it('does not let one in-flight request observe the other response', async () => {
    const kyivSignal = new AbortController().signal;
    const lvivSignal = new AbortController().signal;
    fetchMock.mockImplementation((input, init) => {
      const lat = new URL(String(input)).searchParams.get('lat');
      expect(init?.signal).toBe(lat === '50.45' ? kyivSignal : lvivSignal);
      return Promise.resolve(jsonResponse({ name: lat, main: { temp: lat === '50.45' ? 1 : 2 } }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const [kyiv, lviv] = await Promise.all([
      requestCurrentWeather({ lat: 50.45, lon: 30.52 }, kyivSignal),
      requestCurrentWeather({ lat: 49.84, lon: 24.03 }, lvivSignal),
    ]);

    expect(kyiv.main.temp).toBe(1);
    expect(lviv.main.temp).toBe(2);
  });
});
