import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { weatherService } from '../services/weather/weatherService';
import { useFavoritesStore } from '../stores/favoritesStore';
import type { CityLocation } from '../types/city';
import type { WeatherForecast } from '../types/weather';
import FavoritesView from './FavoritesView.vue';

vi.mock('chart.js', () => {
  class Chart {
    static register(): void {}
    constructor() {}
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

vi.mock('../services/weather/weatherService', () => ({
  weatherService: {
    load: vi.fn(),
  },
}));

const load = vi.mocked(weatherService.load);

const kyiv: CityLocation = {
  name: 'Kyiv',
  country: 'UA',
  lat: 50.45,
  lon: 30.52,
};

const lviv: CityLocation = {
  name: 'Lviv',
  country: 'UA',
  lat: 49.84,
  lon: 24.03,
};

function forecastFor(location: CityLocation): WeatherForecast {
  const kyivForecast = location.lat === kyiv.lat;
  return {
    location,
    timezoneOffsetSeconds: kyivForecast ? 7200 : -36000,
    current: {
      temperatureC: kyivForecast ? 21 : 8,
      feelsLikeC: null,
      humidity: null,
      windSpeed: null,
      pressure: null,
      condition: { description: kyivForecast ? 'clear sky' : 'rain', icon: '01d' },
    },
    entries: [],
    daily: [
      {
        localDate: kyivForecast ? '2026-01-16' : '2026-02-02',
        averageTemperatureC: kyivForecast ? 3 : 8,
        condition: null,
        entryCount: 1,
      },
    ],
  };
}

describe('FavoritesView', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    load.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function mountView() {
    return mount(FavoritesView, { global: { plugins: [createPinia()] } });
  }

  it('shows the empty state when no cities are saved', () => {
    const wrapper = mountView();

    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.find('.weather-widget').exists()).toBe(false);
    expect(wrapper.get('.empty-state').text()).toContain('No favorite cities');
    expect(load).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('renders a search-free widget for each saved city and removes it from the list', async () => {
    load.mockImplementation((input) => Promise.resolve(forecastFor(input.location)));
    const pinia = createPinia();
    setActivePinia(pinia);
    const favorites = useFavoritesStore();
    favorites.add(kyiv);
    favorites.add(lviv);

    const wrapper = mount(FavoritesView, { global: { plugins: [pinia] } });
    await flushPromises();
    await nextTick();

    const widgets = wrapper.findAll('.weather-widget');
    expect(widgets).toHaveLength(2);
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.find('.empty-state').exists()).toBe(false);
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[0]?.[0].location).toEqual(kyiv);
    expect(load.mock.calls[1]?.[0].location).toEqual(lviv);
    expect(widgets[0]?.text()).toContain('Kyiv');
    expect(widgets[0]?.text()).toContain('21°C');
    expect(widgets[1]?.text()).toContain('Lviv');
    expect(widgets[1]?.text()).toContain('8°C');

    await widgets[0]?.get('button[aria-label="Remove from favorites"]').trigger('click');
    expect(favorites.cities).toEqual([lviv]);
    expect(wrapper.findAll('.weather-widget')).toHaveLength(1);
    expect(wrapper.text()).not.toContain('Kyiv');
    expect(wrapper.text()).toContain('Lviv');

    await wrapper.get('button[aria-label="Remove from favorites"]').trigger('click');
    expect(favorites.cities).toEqual([]);
    expect(wrapper.find('.weather-widget').exists()).toBe(false);
    expect(wrapper.get('.empty-state').text()).toContain('No favorite cities');
    wrapper.unmount();
  });

  it('keeps loading and the forecast range independent for each favorite', async () => {
    load.mockImplementation((input) => {
      if (input.location.lat === kyiv.lat) return new Promise(() => undefined);
      return Promise.resolve(forecastFor(lviv));
    });
    const pinia = createPinia();
    setActivePinia(pinia);
    useFavoritesStore().add(kyiv);
    useFavoritesStore().add(lviv);

    const wrapper = mount(FavoritesView, { global: { plugins: [pinia] } });
    await flushPromises();
    await nextTick();

    const widgets = wrapper.findAll('.weather-widget');
    expect(widgets[0]?.text()).toContain('Loading weather');
    expect(widgets[0]?.attributes('aria-busy')).toBe('true');
    expect(widgets[1]?.text()).toContain('Lviv');
    expect(widgets[1]?.text()).not.toContain('2026-02-02');
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(false);

    await widgets[1]?.get('.forecast-range button[aria-pressed="false"]').trigger('click');
    expect(load).toHaveBeenCalledTimes(2);
    expect(widgets[0]?.text()).toContain('Loading weather');
    expect(widgets[0]?.text()).not.toContain('2026-02-02');
    expect(widgets[1]?.get('.forecast-range button[aria-pressed="true"]').text()).toBe('5 Days');
    expect(widgets[1]?.text()).toContain('2026-02-02');
    wrapper.unmount();
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(true);
  });
});
