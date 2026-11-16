import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_DASHBOARD_WIDGETS } from '../stores/weatherWidgetsStore';
import WeatherView from './WeatherView.vue';

vi.mock('../services/location/ipLocationService', () => ({
  ipLocationService: {
    detect: vi.fn(() => Promise.resolve(null)),
  },
}));

describe('WeatherView', () => {
  beforeEach(() => {
    let nextId = 0;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      nextId += 1;
      return `00000000-0000-4000-8000-${String(nextId).padStart(12, '0')}`;
    });
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountView() {
    const pinia = createPinia();
    setActivePinia(pinia);
    return mount(WeatherView, { global: { plugins: [pinia] } });
  }

  it('adds a widget and removes it only after confirmation', async () => {
    const wrapper = mountView();
    const add = wrapper.get('button.app-button--primary');

    expect(wrapper.findAll('.weather-widget')).toHaveLength(1);
    expect(wrapper.find('input').attributes('id')).toBe(
      '00000000-0000-4000-8000-000000000001-city',
    );
    expect(add.attributes('disabled')).toBeUndefined();
    expect(wrapper.find('.weather-dashboard__limit').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Remove');

    await add.trigger('click');
    expect(wrapper.findAll('.weather-widget')).toHaveLength(2);
    expect(wrapper.findAll('input')[1]?.attributes('id')).toBe(
      '00000000-0000-4000-8000-000000000002-city',
    );

    await wrapper.findAll('button.app-button--danger')[0]?.trigger('click');
    expect(wrapper.get('[role="dialog"]').text()).toContain('Remove widget');
    await wrapper.get('[role="dialog"]').findAll('button')[0]?.trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(wrapper.findAll('.weather-widget')).toHaveLength(2);

    await wrapper.findAll('button.app-button--danger')[0]?.trigger('click');
    await wrapper.get('[role="dialog"]').findAll('button')[1]?.trigger('click');
    expect(wrapper.findAll('.weather-widget')).toHaveLength(1);
    expect(wrapper.find('input').attributes('id')).toBe(
      '00000000-0000-4000-8000-000000000002-city',
    );
    wrapper.unmount();
  });

  it('disables adding a widget at the dashboard limit', async () => {
    const wrapper = mountView();
    const add = wrapper.get('button.app-button--primary');

    for (let index = 1; index < MAX_DASHBOARD_WIDGETS; index += 1) {
      await add.trigger('click');
    }

    expect(wrapper.findAll('.weather-widget')).toHaveLength(MAX_DASHBOARD_WIDGETS);
    expect(add.attributes('disabled')).toBeDefined();
    expect(wrapper.get('.weather-dashboard__limit').text()).toBe('Maximum of 5 widgets.');
    wrapper.unmount();
  });
});
