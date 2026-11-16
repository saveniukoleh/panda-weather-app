import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';
import App from './App.vue';

vi.mock('./services/location/ipLocationService', () => ({
  ipLocationService: {
    detect: vi.fn(() => Promise.resolve(null)),
  },
}));

function mountApp() {
  return mount(App, { global: { plugins: [createPinia()] } });
}

describe('application shell', () => {
  it('mounts the weather view by default', () => {
    const wrapper = mountApp();

    expect(wrapper.get('.app-header__title').text()).toBe('Panda Weather');
    expect(document.documentElement.lang).toBe('en');
    expect(wrapper.get('#tab-weather').attributes('aria-selected')).toBe('true');
    expect(wrapper.get('#weather-panel').isVisible()).toBe(true);
    expect(wrapper.get('#favorites-panel').isVisible()).toBe(false);
  });

  it('switches to the favorites view', async () => {
    const wrapper = mountApp();

    await wrapper.get('#tab-favorites').trigger('click');

    expect(wrapper.get('#tab-favorites').attributes('aria-selected')).toBe('true');
    expect(wrapper.get('#tab-weather').attributes('aria-selected')).toBe('false');
    expect(wrapper.get('#favorites-panel').isVisible()).toBe(true);
    expect(wrapper.get('#weather-panel').isVisible()).toBe(false);
    expect(wrapper.get('#favorites-panel').text()).toContain('Favorites');
  });

  it('switches the interface language without reloading', async () => {
    const wrapper = mountApp();

    await wrapper.get('[aria-label="Language"] button[aria-pressed="false"]').trigger('click');

    expect(wrapper.get('#tab-weather').text()).toBe('Погода');
    expect(wrapper.get('#tab-favorites').text()).toBe('Обране');
    expect(wrapper.get('.app-header__title').text()).toBe('Panda Weather');
    expect(document.documentElement.lang).toBe('uk');
    expect(localStorage.getItem('panda-weather.locale')).toBe('uk');

    await wrapper.get('[aria-label="Мова"] button[aria-pressed="false"]').trigger('click');

    expect(wrapper.get('#tab-weather').text()).toBe('Weather');
    expect(wrapper.get('#tab-favorites').text()).toBe('Favorites');
    expect(wrapper.get('.app-header__title').text()).toBe('Panda Weather');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('panda-weather.locale')).toBe('en');
  });
});
