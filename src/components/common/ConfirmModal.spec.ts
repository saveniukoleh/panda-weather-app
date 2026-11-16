import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
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

    await wrapper.get('.confirm-modal').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(2);
  });

  it('shows only the confirm action when cancel is hidden', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Favorites limit',
        message: 'Remove an existing favorite before adding another city.',
        confirmLabel: 'OK',
        hideCancel: true,
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.text()).toBe('OK');
  });

  it('moves focus into the dialog and returns it to the opener', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const wrapper = mount(ConfirmModal, {
      attachTo: document.body,
      props: {
        open: false,
        title: 'Remove item',
        message: 'This cannot be undone.',
        confirmLabel: 'Remove',
        cancelLabel: 'Keep',
      },
    });

    await wrapper.setProps({ open: true });
    await nextTick();

    const [cancel, confirm] = wrapper.findAll('button');
    expect(document.activeElement).toBe(cancel?.element);

    confirm?.element.focus();
    await wrapper.get('.confirm-modal__backdrop').trigger('keydown', { key: 'Tab' });
    expect(document.activeElement).toBe(cancel?.element);

    await wrapper.get('.confirm-modal__backdrop').trigger('keydown', { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(confirm?.element);

    await wrapper.setProps({ open: false });
    expect(document.activeElement).toBe(opener);
    wrapper.unmount();
  });
});

afterEach(() => {
  document.body.innerHTML = '';
});
