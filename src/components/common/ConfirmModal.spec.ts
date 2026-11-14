import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ConfirmModal from './ConfirmModal.vue';

describe('ConfirmModal', () => {
  it('is hidden when closed', () => {
    const wrapper = mount(ConfirmModal, {
      props: { open: false, title: 'Remove item', message: 'This cannot be undone.' },
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('emits confirm and cancel from the dialog actions', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Remove item',
        message: 'This cannot be undone.',
        confirmLabel: 'Remove',
        cancelLabel: 'Keep',
      },
    });

    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.attributes('aria-modal')).toBe('true');
    expect(dialog.text()).toContain('Remove item');

    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('cancels on Escape and backdrop click', async () => {
    const wrapper = mount(ConfirmModal, {
      props: { open: true, title: 'Remove item', message: 'This cannot be undone.' },
    });

    await wrapper.get('.confirm-modal__backdrop').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    await wrapper.get('.confirm-modal__backdrop').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(2);
  });
});
