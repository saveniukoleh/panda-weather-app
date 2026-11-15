import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { weatherService } from '../../services/weather/weatherService';
import { MAX_FAVORITES, useFavoritesStore } from '../../stores/favoritesStore';
import type { CityLocation } from '../../types/city';
import type { WeatherForecast } from '../../types/weather';
import WeatherWidget from './WeatherWidget.vue';

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

describe('WeatherWidget favorites', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    load.mockResolvedValue(forecastFor(kyiv));
  });

  afterEach(() => {
    load.mockReset();
  });

  async function mountLoaded(): Promise<ReturnType<typeof mount>> {
    const wrapper = mount(WeatherWidget, {
      props: { searchable: false, location: kyiv },
    });
    await flushPromises();
    await nextTick();
    return wrapper;
  }

  it('adds and removes the displayed city', async () => {
    const wrapper = await mountLoaded();
    const favorites = useFavoritesStore();

    const add = wrapper.get('button[aria-label="Add to favorites"]');
    expect(add.text()).toBe('Favorite');
    expect(add.attributes('aria-pressed')).toBe('false');

    await add.trigger('click');
    expect(favorites.cities).toEqual([kyiv]);
    const remove = wrapper.get('button[aria-label="Remove from favorites"]');
    expect(remove.text()).toBe('Favorited');
    expect(remove.attributes('aria-pressed')).toBe('true');

    await remove.trigger('click');
    expect(favorites.cities).toEqual([]);
    expect(wrapper.get('button[aria-label="Add to favorites"]').attributes('aria-pressed')).toBe(
      'false',
    );
    wrapper.unmount();
  });

  it('shows the limit modal and does not save a sixth city', async () => {
    const favorites = useFavoritesStore();
    for (let index = 0; index < MAX_FAVORITES; index += 1) {
      favorites.add({ name: `City ${index}`, country: 'UA', lat: index, lon: index });
    }

    const wrapper = await mountLoaded();
    await wrapper.get('button[aria-label="Add to favorites"]').trigger('click');

    expect(favorites.cities).toHaveLength(MAX_FAVORITES);
    expect(favorites.isFavorite(kyiv)).toBe(false);
    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.text()).toContain('Favorites limit');
    expect(dialog.text()).toContain('Remove an existing favorite before adding another city.');

    await wrapper.get('.confirm-modal__backdrop').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(favorites.cities).toHaveLength(MAX_FAVORITES);
    wrapper.unmount();
  });
});
