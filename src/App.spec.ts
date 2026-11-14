import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from './App.vue';

describe('test environment', () => {
  it('mounts the root Vue component', () => {
    const wrapper = mount(App);
    expect(wrapper.exists()).toBe(true);
  });
});
