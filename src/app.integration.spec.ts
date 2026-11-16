import { nextTick } from 'vue';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';
import TemperatureChart from './components/weather/TemperatureChart.vue';
import { CITY_SEARCH_DEBOUNCE_MS } from './composables/useCitySearch';
import { FAVORITES_STORAGE_KEY } from './stores/favoritesStore';

vi.mock('chart.js', () => {
  class Chart {
    static register(): void {}
    data: { labels?: unknown; datasets: { data?: unknown }[] };
    options: { color?: string; scales?: Record<string, unknown> };
    constructor(
      _item: unknown,
      config: {
        data: { labels?: unknown; datasets: { data?: unknown }[] };
        options: { color?: string; scales?: Record<string, unknown> };
      },
    ) {
      this.data = config.data;
      this.options = config.options;
    }
    update(): void {}
    destroy(): void {}
  }
  return {
    Chart,
    CategoryScale: {},
    LinearScale: {},
    LineController: {},
    LineElement: {},
    PointElement: {},
    Tooltip: {},
  };
});

const NOW = '2026-01-16T02:00:00Z';
const SLOTS = [
  '2026-01-16T01:00:00Z',
  '2026-01-16T02:00:00Z',
  '2026-01-16T15:00:00Z',
  '2026-01-17T02:00:00Z',
  '2026-01-17T06:00:00Z',
];

const kyiv = { name: 'Kyiv', country: 'UA', state: 'Kyiv City', lat: 50.45, lon: 30.52 };
const lviv = { name: 'Lviv', country: 'UA', lat: 49.84, lon: 24.03 };

type Failure = 'none' | 'geocoding' | 'rate-limit' | 'network' | 'invalid';

let failure: Failure = 'none';
const fetchMock = vi.fn<typeof fetch>();

function unix(isoUtc: string): number {
  return Date.parse(isoUtc) / 1000;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function currentBody(temp: number): unknown {
  return {
    name: 'Provider',
    main: { temp },
    weather: [{ description: 'clear sky', icon: '01d' }],
  };
}

function forecastBody(name: string, country: string, lat: number, lon: number, temps: number[]) {
  return {
    city: { name, country, timezone: 0, coord: { lat, lon } },
    list: SLOTS.map((isoUtc, index) => ({
      dt: unix(isoUtc),
      main: { temp: temps[index] },
      weather: [{ description: 'clouds', icon: '03d' }],
    })),
  };
}

function installFetch(): void {
  fetchMock.mockImplementation((input) => {
    const url = new URL(String(input));
    if (url.hostname === 'get.geojs.io') return new Promise(() => undefined);
    if (url.origin !== 'https://worker.example') {
      return Promise.reject(new Error(`unexpected host ${url.origin}`));
    }
    if (failure === 'network') {
      return Promise.reject(new TypeError('Failed to fetch https://secret.example'));
    }

    if (url.pathname === '/geocoding') {
      if (failure === 'geocoding') {
        return Promise.resolve(jsonResponse({ error: { message: 'token sk-live' } }, 500));
      }
      const query = url.searchParams.get('q');
      const place = query === 'Lviv' ? lviv : kyiv;
      return Promise.resolve(jsonResponse([place]));
    }

    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const lvivRequest = lat === String(lviv.lat);
    if (failure === 'rate-limit' && lvivRequest) {
      return Promise.resolve(jsonResponse({ message: 'quota sk-live' }, 429));
    }
    if (failure === 'invalid' && url.pathname === '/weather') {
      return Promise.resolve(jsonResponse({ name: 'Kyiv', secret: 'sk-live' }));
    }
    if (url.pathname === '/weather') {
      return Promise.resolve(jsonResponse(currentBody(lvivRequest ? 8 : 21)));
    }
    if (url.pathname === '/forecast') {
      const city = lvivRequest ? lviv : kyiv;
      return Promise.resolve(
        jsonResponse(
          forecastBody(city.name, city.country, Number(lat), Number(lon), [1, 11, 14, 8, 20]),
        ),
      );
    }
    return Promise.reject(new Error(url.pathname));
  });
  vi.stubGlobal('fetch', fetchMock);
}

function requestedUrls(): string[] {
  return fetchMock.mock.calls.map((call) => String(call[0]));
}

function mountApp(): VueWrapper {
  return mount(App, { global: { plugins: [createPinia()] } });
}

async function searchCity(
  widget: { get(selector: string): { setValue(value: string): Promise<void> } },
  name: string,
): Promise<void> {
  await widget.get('input').setValue(name);
  await vi.advanceTimersByTimeAsync(CITY_SEARCH_DEBOUNCE_MS);
  await flushPromises();
  await nextTick();
}

describe('application integration', () => {
  beforeEach(() => {
    failure = 'none';
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubEnv('VITE_API_BASE_URL', 'https://worker.example');
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(NOW));
    installFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  it('searches through the worker and switches forecast range without another request', async () => {
    const wrapper = mountApp();
    const widget = wrapper.get('#weather-panel .weather-widget');

    await searchCity(widget, 'Kyiv');
    const suggestion = widget.get('button[role="option"]');
    expect(suggestion.text()).toBe('Kyiv, Kyiv City, UA');
    expect(requestedUrls().some((url) => url.includes('openweathermap'))).toBe(false);
    expect(requestedUrls().some((url) => url.includes('/geocoding?q=Kyiv&limit=5'))).toBe(true);

    await suggestion.trigger('click');
    await flushPromises();
    await nextTick();

    const weatherUrls = requestedUrls().filter((url) => url.includes('/weather?'));
    const forecastUrls = requestedUrls().filter((url) => url.includes('/forecast?'));
    expect(weatherUrls.some((url) => url.includes('lat=50.45') && url.includes('lon=30.52'))).toBe(
      true,
    );
    expect(forecastUrls.some((url) => url.includes('lat=50.45') && url.includes('lon=30.52'))).toBe(
      true,
    );
    expect(widget.text()).toContain('Kyiv');
    expect(widget.text()).toContain('21°C');
    expect(widget.text()).toContain('clear sky');
    expect(widget.get('.forecast-range button[aria-pressed="true"]').text()).toBe('24 Hours');
    expect(widget.getComponent(TemperatureChart).props('points')).toEqual([
      { label: '02:00', temperatureC: 11 },
      { label: '15:00', temperatureC: 14 },
      { label: '02:00', temperatureC: 8 },
    ]);

    const callsBeforeRangeChange = fetchMock.mock.calls.length;
    await widget.get('.forecast-range button[aria-pressed="false"]').trigger('click');
    expect(widget.get('.forecast-range button[aria-pressed="true"]').text()).toBe('5 Days');
    expect(widget.text()).toContain('2026-01-16');
    expect(widget.text()).toContain('9°C');
    expect(widget.text()).toContain('2026-01-17');
    expect(widget.text()).toContain('14°C');
    expect(widget.getComponent(TemperatureChart).props('points')).toEqual([
      { label: '2026-01-16', temperatureC: 26 / 3 },
      { label: '2026-01-17', temperatureC: 14 },
    ]);

    await widget.get('.forecast-range button[aria-pressed="false"]').trigger('click');
    expect(widget.get('.forecast-range button[aria-pressed="true"]').text()).toBe('24 Hours');
    expect(widget.text()).not.toContain('2026-01-16');
    expect(widget.getComponent(TemperatureChart).props('points')).toEqual([
      { label: '02:00', temperatureC: 11 },
      { label: '15:00', temperatureC: 14 },
      { label: '02:00', temperatureC: 8 },
    ]);
    expect(fetchMock.mock.calls).toHaveLength(callsBeforeRangeChange);
    wrapper.unmount();
  });

  it('keeps two widgets independent when one city is rate limited', async () => {
    const wrapper = mountApp();
    const first = wrapper.get('#weather-panel .weather-widget');
    await searchCity(first, 'Kyiv');
    await first.get('button[role="option"]').trigger('click');
    await flushPromises();

    await wrapper.get('button.app-button--primary').trigger('click');
    failure = 'rate-limit';
    const widgets = wrapper.findAll('#weather-panel .weather-widget');
    await searchCity(widgets[1]!, 'Lviv');
    await widgets[1]!.get('button[role="option"]').trigger('click');
    await flushPromises();
    await nextTick();

    expect(requestedUrls().some((url) => url.includes('lat=49.84') && url.includes('lon=24.03'))).toBe(
      true,
    );
    expect(widgets[0]!.text()).toContain('Kyiv');
    expect(widgets[0]!.text()).toContain('21°C');
    expect(widgets[0]!.find('[role="alert"]').exists()).toBe(false);
    expect(widgets[1]!.text()).toContain('The weather service is rate limited. Try again later.');
    expect(widgets[1]!.text()).not.toContain('sk-live');
    expect(widgets[1]!.text()).not.toContain('Loading weather');

    failure = 'none';
    await widgets[1]!.get('button').trigger('click');
    await flushPromises();
    await nextTick();
    expect(widgets[1]!.text()).toContain('Lviv');
    expect(widgets[1]!.text()).toContain('8°C');
    expect(widgets[0]!.text()).toContain('21°C');
    expect(widgets[0]!.text()).not.toContain('8°C');
    wrapper.unmount();
  });

  it('restores a favorite after a new application instance mounts', async () => {
    const firstApp = mountApp();
    const widget = firstApp.get('#weather-panel .weather-widget');
    await searchCity(widget, 'Kyiv');
    await widget.get('button[role="option"]').trigger('click');
    await flushPromises();
    await firstApp.get('#weather-panel button[aria-label="Add to favorites"]').trigger('click');

    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? 'null')).toEqual([kyiv]);
    firstApp.unmount();

    const reloaded = mountApp();
    await flushPromises();
    await nextTick();
    await reloaded.get('#tab-favorites').trigger('click');

    const favorites = reloaded.get('#favorites-panel');
    expect(favorites.find('input').exists()).toBe(false);
    expect(favorites.text()).toContain('Kyiv');
    expect(favorites.text()).toContain('21°C');
    expect(
      requestedUrls().some(
        (url) => url.includes('/forecast?') && url.includes('lat=50.45') && url.includes('lon=30.52'),
      ),
    ).toBe(true);
    reloaded.unmount();
  });

  it('shows worker and network failures without leaking the response text', async () => {
    failure = 'geocoding';
    const geocodingApp = mountApp();
    const geocodingWidget = geocodingApp.get('#weather-panel .weather-widget');
    await searchCity(geocodingWidget, 'Kyiv');
    expect(geocodingWidget.get('[role="alert"]').text()).toContain(
      'The weather service is unavailable.',
    );
    expect(geocodingWidget.text()).not.toContain('sk-live');
    expect(requestedUrls().some((url) => url.includes('/weather?'))).toBe(false);
    geocodingApp.unmount();

    failure = 'network';
    fetchMock.mockClear();
    const networkApp = mountApp();
    const networkWidget = networkApp.get('#weather-panel .weather-widget');
    await searchCity(networkWidget, 'Kyiv');
    expect(networkWidget.get('[role="alert"]').text()).toContain(
      'The weather service could not be reached.',
    );
    expect(networkWidget.text()).not.toContain('secret.example');
    expect(networkWidget.text()).not.toContain('Loading weather');
    networkApp.unmount();

    failure = 'invalid';
    const invalidApp = mountApp();
    const invalidWidget = invalidApp.get('#weather-panel .weather-widget');
    await searchCity(invalidWidget, 'Kyiv');
    await invalidWidget.get('button[role="option"]').trigger('click');
    await flushPromises();
    await nextTick();
    expect(invalidWidget.get('[role="alert"]').text()).toContain(
      'The weather service returned an unexpected response.',
    );
    expect(invalidWidget.text()).not.toContain('sk-live');
    expect(invalidWidget.text()).not.toContain('Loading weather');
    invalidApp.unmount();
  });
});
