import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppButton from './AppButton.vue';

describe('AppButton', () => {
  it('renders the default slot and emits click', async () => {
    const wrapper = mount(AppButton, { slots: { default: 'Save' } });

    expect(wrapper.text()).toContain('Save');
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled or loading', async () => {
    const disabled = mount(AppButton, { props: { disabled: true } });
    await disabled.trigger('click');
    expect(disabled.emitted('click')).toBeUndefined();

    const loading = mount(AppButton, { props: { loading: true } });
    expect(loading.attributes('aria-busy')).toBe('true');
    expect(loading.attributes('disabled')).toBeDefined();
    await loading.trigger('click');
    expect(loading.emitted('click')).toBeUndefined();
  });
});
