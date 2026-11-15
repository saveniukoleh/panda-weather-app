import { nextTick } from 'vue';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CITY_SEARCH_DEBOUNCE_MS } from '../../composables/useCitySearch';
import { AppRequestError } from '../../services/api/errors';
import { geocodingService } from '../../services/weather/geocodingService';
import { weatherService } from '../../services/weather/weatherService';
import type { CityLocation } from '../../types/city';
import type { WeatherForecast } from '../../types/weather';
import WeatherWidget from './WeatherWidget.vue';

vi.mock('../../services/weather/geocodingService', () => ({
  geocodingService: {
    search: vi.fn(),
  },
}));

vi.mock('../../services/weather/weatherService', () => ({
  weatherService: {
    load: vi.fn(),
  },
}));

const search = vi.mocked(geocodingService.search);
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

function forecastFor(location: CityLocation): WeatherForecast {
  return {
    location,
    timezoneOffsetSeconds: 7200,
    current: {
      temperatureC: 21,
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

async function chooseCity(widget: VueWrapper, city: CityLocation): Promise<void> {
  search.mockResolvedValueOnce([city]);
  await widget.get('input').setValue(city.name);
  await vi.advanceTimersByTimeAsync(CITY_SEARCH_DEBOUNCE_MS);
  await nextTick();
  const option = widget.get('button[role="option"]');
  expect(option.text()).toContain(city.name);
  await option.trigger('click');
}

describe('WeatherWidget', () => {
  afterEach(() => {
    search.mockReset();
    load.mockReset();
    vi.useRealTimers();
  });

  it('starts idle, exposes a city search, and ignores a location prop while searchable', () => {
    const wrapper = mount(WeatherWidget, { props: { id: 'widget-a', location: kyiv } });

    const input = wrapper.get('input');
    expect(input.attributes('id')).toBe('widget-a-city');
    expect(input.attributes('type')).toBe('search');
    expect(wrapper.get('label').attributes('for')).toBe('widget-a-city');
    expect(wrapper.attributes('aria-busy')).toBe('false');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Loading weather');
    expect(load).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('hides search and stays idle when a non-searchable widget has no city', () => {
    const wrapper = mount(WeatherWidget, { props: { searchable: false } });

    expect(wrapper.find('input').exists()).toBe(false);
    expect(load).not.toHaveBeenCalled();
    expect(wrapper.text()).not.toContain('Loading weather');
    expect(wrapper.attributes('aria-busy')).toBe('false');
    wrapper.unmount();
  });

  it('gives an omitted id a unique search control id', () => {
    const first = mount(WeatherWidget);
    const second = mount(WeatherWidget);

    const firstId = first.get('input').attributes('id');
    const secondId = second.get('input').attributes('id');
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    first.unmount();
    second.unmount();
  });

  it('loads a locked city and follows locale, location, and clear changes', async () => {
    load.mockImplementation(() => new Promise(() => undefined));
    const wrapper = mount(WeatherWidget, {
      props: { id: 'locked', searchable: false, location: kyiv, locale: 'uk' },
    });

    expect(wrapper.find('input').exists()).toBe(false);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith({
      location: kyiv,
      locale: 'uk',
      signal: expect.any(AbortSignal),
    });
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.text()).toContain('Loading weather');

    const firstSignal = load.mock.calls[0]?.[0].signal;
    await wrapper.setProps({ locale: 'en' });
    expect(firstSignal?.aborted).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[1]?.[0]).toMatchObject({ location: kyiv, locale: 'en' });

    const secondSignal = load.mock.calls[1]?.[0].signal;
    await wrapper.setProps({ location: lviv });
    expect(secondSignal?.aborted).toBe(true);
    expect(load).toHaveBeenCalledTimes(3);
    expect(load.mock.calls[2]?.[0].location).toEqual(lviv);
    expect(load.mock.calls[2]?.[0].signal).not.toBe(secondSignal);

    const thirdSignal = load.mock.calls[2]?.[0].signal;
    await wrapper.setProps({ location: null });
    expect(thirdSignal?.aborted).toBe(true);
    expect(load).toHaveBeenCalledTimes(3);
    expect(wrapper.text()).not.toContain('Loading weather');
    expect(wrapper.attributes('aria-busy')).toBe('false');
    wrapper.unmount();
  });

  it('loads weather for the selected suggestion without rendering the forecast', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let resolveLoad: (forecast: WeatherForecast) => void = () => undefined;
    load.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const wrapper = mount(WeatherWidget, { props: { id: 'kyiv-widget', locale: 'en' } });

    search.mockResolvedValueOnce([kyiv]);
    await wrapper.get('#kyiv-widget-city').setValue('Kyi');
    await vi.advanceTimersByTimeAsync(CITY_SEARCH_DEBOUNCE_MS);
    await nextTick();

    expect(search).toHaveBeenCalledWith({
      query: 'Kyi',
      limit: undefined,
      signal: expect.any(AbortSignal),
    });
    const option = wrapper.get('button[role="option"]');
    expect(option.text()).toBe('Kyiv, Kyiv City, UA');
    await option.trigger('click');

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith({
      location: kyiv,
      locale: 'en',
      signal: expect.any(AbortSignal),
    });
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Kyiv');
    expect(wrapper.find('button[role="option"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('Loading weather');
    expect(wrapper.attributes('aria-busy')).toBe('true');

    resolveLoad(forecastFor(kyiv));
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).not.toContain('Loading weather');
    expect(wrapper.text()).not.toContain('21');
    expect(wrapper.text()).not.toContain('clear sky');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shows a failed city search on that widget and does not load weather', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const wrapper = mount(WeatherWidget, { props: { id: 'search' } });

    search.mockRejectedValueOnce(new AppRequestError('network'));
    await wrapper.get('input').setValue('Kyiv');
    await vi.advanceTimersByTimeAsync(CITY_SEARCH_DEBOUNCE_MS);
    await flushPromises();
    await nextTick();

    expect(load).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('The weather service could not be reached.');
    expect(wrapper.text()).not.toContain('Loading weather');
    wrapper.unmount();
  });

  it('shows a weather error and retries the same city', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    load.mockRejectedValueOnce(new AppRequestError('rate_limit'));
    const wrapper = mount(WeatherWidget, { props: { id: 'retry' } });

    await chooseCity(wrapper, kyiv);
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).toContain('The weather service is rate limited. Try again later.');
    expect(wrapper.text()).not.toContain('Loading weather');

    load.mockImplementation(() => new Promise(() => undefined));
    await wrapper.get('button').trigger('click');
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[0]?.[0].locale).toBe('en');
    expect(load.mock.calls[1]?.[0].location).toEqual(kyiv);
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(true);
    expect(wrapper.text()).toContain('Loading weather');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('aborts an in-flight weather request when the search query changes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let rejectLoad: (reason?: unknown) => void = () => undefined;
    load.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectLoad = reject;
        }),
    );
    const wrapper = mount(WeatherWidget, { props: { id: 'edit' } });

    await chooseCity(wrapper, kyiv);
    const signal = load.mock.calls[0]?.[0].signal;
    expect(wrapper.text()).toContain('Loading weather');

    await wrapper.get('input').setValue('Lv');
    expect(signal?.aborted).toBe(true);
    expect(wrapper.text()).not.toContain('Loading weather');

    rejectLoad(new AppRequestError('network'));
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).not.toContain('The weather service could not be reached.');
    expect(load).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('keeps loading and errors isolated between widgets', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    load.mockImplementation((input) => {
      if (input.location.lat === lviv.lat) return Promise.reject(new AppRequestError('not_found'));
      return new Promise(() => undefined);
    });
    const first = mount(WeatherWidget, { props: { id: 'first', locale: 'en' } });
    const second = mount(WeatherWidget, { props: { id: 'second', locale: 'uk' } });

    await chooseCity(first, kyiv);
    await chooseCity(second, lviv);
    await flushPromises();
    await nextTick();

    expect(load.mock.calls[0]?.[0]).toMatchObject({ location: kyiv, locale: 'en' });
    expect(load.mock.calls[1]?.[0]).toMatchObject({ location: lviv, locale: 'uk' });
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(false);
    expect(first.text()).toContain('Loading weather');
    expect(first.find('[role="alert"]').exists()).toBe(false);
    expect(second.text()).toContain('The requested data was not found.');
    expect(second.text()).not.toContain('Loading weather');
    expect((first.get('input').element as HTMLInputElement).value).toBe('Kyiv');
    expect((second.get('input').element as HTMLInputElement).value).toBe('Lviv');

    first.unmount();
    expect(load.mock.calls[0]?.[0].signal?.aborted).toBe(true);
    expect(second.text()).toContain('The requested data was not found.');
    second.unmount();
  });

  it('aborts the weather request when the widget is removed', () => {
    load.mockImplementation(() => new Promise(() => undefined));
    const wrapper = mount(WeatherWidget, {
      props: { searchable: false, location: kyiv },
    });

    const signal = load.mock.calls[0]?.[0].signal;
    wrapper.unmount();
    expect(signal?.aborted).toBe(true);
  });
});
