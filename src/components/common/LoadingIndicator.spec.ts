import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LoadingIndicator from './LoadingIndicator.vue';

describe('LoadingIndicator', () => {
  it('announces the default loading status', () => {
    const wrapper = mount(LoadingIndicator);

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-live')).toBe('polite');
    expect(wrapper.text()).toBe('Loading');
  });

  it('renders a custom label', () => {
    const wrapper = mount(LoadingIndicator, { props: { label: 'Fetching cities' } });
    expect(wrapper.text()).toBe('Fetching cities');
  });
});
