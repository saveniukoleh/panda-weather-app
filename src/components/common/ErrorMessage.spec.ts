import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ErrorMessage from './ErrorMessage.vue';

describe('ErrorMessage', () => {
  it('shows the message as an alert without retry by default', () => {
    const wrapper = mount(ErrorMessage, { props: { message: 'Request failed' } });

    expect(wrapper.attributes('role')).toBe('alert');
    expect(wrapper.text()).toContain('Request failed');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('emits retry when the retry action is used', async () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: 'Request failed', retryLabel: 'Try again' },
    });

    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
