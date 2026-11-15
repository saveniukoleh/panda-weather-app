import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toWeatherChartDatasets } from '../../services/weather/normalizeWeather';
import { weatherService } from '../../services/weather/weatherService';
import type { CityLocation } from '../../types/city';
import type { WeatherForecast } from '../../types/weather';
import TemperatureChart from './TemperatureChart.vue';
import WeatherWidget from './WeatherWidget.vue';

vi.mock('chart.js', () => {
  class Chart {
    static register(): void {}
    data: { labels?: unknown; datasets: { data?: unknown }[] };
    constructor(_item: unknown, config: { data: { labels?: unknown; datasets: { data?: unknown }[] } }) {
      this.data = config.data;
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

vi.mock('../../services/weather/weatherService', () => ({
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
  const kyivForecast = location.name === 'Kyiv';
  return {
    location,
    timezoneOffsetSeconds: kyivForecast ? 7200 : -36000,
    current: {
      temperatureC: 21,
      feelsLikeC: null,
      humidity: null,
      windSpeed: null,
      pressure: null,
      condition: { description: 'clear sky', icon: '01d' },
    },
    entries: [],
    daily: [
      {
        localDate: kyivForecast ? '2026-01-16' : '2026-02-02',
        averageTemperatureC: kyivForecast ? 3 : 8,
        condition: kyivForecast ? { description: 'clouds', icon: '03d' } : null,
        entryCount: 1,
      },
    ],
  };
}

describe('WeatherWidget forecast range', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    load.mockReset();
  });

  it('switches between the current day and daily averages without another request', async () => {
    const forecast = forecastFor(kyiv);
    load.mockResolvedValueOnce(forecast);
    const wrapper = mount(WeatherWidget, {
      props: { id: 'range', searchable: false, location: kyiv },
    });

    await flushPromises();
    await nextTick();

    expect(load).toHaveBeenCalledTimes(1);
    expect(wrapper.get('.forecast-range button[aria-pressed="true"]').text()).toBe('Day');
    expect(wrapper.text()).toContain('clear sky');
    expect(wrapper.text()).not.toContain('2026-01-16');
    expect(wrapper.getComponent(TemperatureChart).props('points')).toEqual(
      toWeatherChartDatasets(forecast).currentDay,
    );

    await wrapper.get('.forecast-range button[aria-pressed="false"]').trigger('click');
    expect(load).toHaveBeenCalledTimes(1);
    expect(wrapper.get('.forecast-range button[aria-pressed="true"]').text()).toBe('5 Days');
    expect(wrapper.text()).toContain('2026-01-16');
    expect(wrapper.text()).toContain('3°C');
    expect(wrapper.text()).toContain('clouds');
    expect(wrapper.find('img[alt="clouds"]').exists()).toBe(true);
    expect(wrapper.getComponent(TemperatureChart).props('points')).toEqual(
      toWeatherChartDatasets(forecast).dailyAverages,
    );

    await wrapper.get('.forecast-range button[aria-pressed="false"]').trigger('click');
    expect(wrapper.text()).not.toContain('2026-01-16');
    expect(wrapper.getComponent(TemperatureChart).props('points')).toEqual([]);
    wrapper.unmount();
  });

  it('keeps each widget mode independent and drops the previous city forecast', async () => {
    load.mockImplementation((input) => Promise.resolve(forecastFor(input.location)));
    const first = mount(WeatherWidget, {
      props: { id: 'first', searchable: false, location: kyiv },
    });
    const second = mount(WeatherWidget, {
      props: { id: 'second', searchable: false, location: lviv },
    });

    await flushPromises();
    await nextTick();
    await second.get('.forecast-range button[aria-pressed="false"]').trigger('click');

    expect(first.get('.forecast-range button[aria-pressed="true"]').text()).toBe('Day');
    expect(first.text()).not.toContain('2026-02-02');
    expect(second.get('.forecast-range button[aria-pressed="true"]').text()).toBe('5 Days');
    expect(second.text()).toContain('2026-02-02');
    expect(second.text()).toContain('8°C');
    expect(second.find('img[alt="clouds"]').exists()).toBe(false);
    expect(second.getComponent(TemperatureChart).props('points')).toEqual(
      toWeatherChartDatasets(forecastFor(lviv)).dailyAverages,
    );

    let resolveNext: (forecast: WeatherForecast) => void = () => undefined;
    load.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveNext = resolve;
        }),
    );
    await second.setProps({ location: kyiv });
    expect(second.text()).not.toContain('2026-02-02');

    resolveNext(forecastFor(kyiv));
    await flushPromises();
    await nextTick();
    expect(second.text()).toContain('2026-01-16');
    expect(second.text()).not.toContain('2026-02-02');
    expect(first.text()).not.toContain('2026-01-16');
    first.unmount();
    second.unmount();
  });
});
