import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState.vue';

describe('EmptyState', () => {
  it('renders title and description', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items', description: 'Nothing here yet.' },
    });

    expect(wrapper.text()).toContain('No items');
    expect(wrapper.text()).toContain('Nothing here yet.');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('emits action when the optional action is clicked', async () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items', actionLabel: 'Add item' },
    });

    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('action')).toHaveLength(1);
  });
});
