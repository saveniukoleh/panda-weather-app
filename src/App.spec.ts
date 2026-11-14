import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from './App.vue';

describe('application shell', () => {
  it('mounts the weather view by default', () => {
    const wrapper = mount(App);

    expect(wrapper.get('.app-header').text()).toContain('Panda Weather App');
    expect(wrapper.get('#tab-weather').attributes('aria-selected')).toBe('true');
    expect(wrapper.get('#weather-panel').isVisible()).toBe(true);
    expect(wrapper.get('#favorites-panel').isVisible()).toBe(false);
  });

  it('switches to the favorites view', async () => {
    const wrapper = mount(App);

    await wrapper.get('#tab-favorites').trigger('click');

    expect(wrapper.get('#tab-favorites').attributes('aria-selected')).toBe('true');
    expect(wrapper.get('#tab-weather').attributes('aria-selected')).toBe('false');
    expect(wrapper.get('#favorites-panel').isVisible()).toBe(true);
    expect(wrapper.get('#weather-panel').isVisible()).toBe(false);
    expect(wrapper.get('#favorites-panel').text()).toContain('Favorites');
  });
});
