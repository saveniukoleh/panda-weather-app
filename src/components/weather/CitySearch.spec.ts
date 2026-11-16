import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { CityLocation } from '../../types/city';
import CitySearch from './CitySearch.vue';

const kyiv: CityLocation = {
  name: 'Kyiv',
  country: 'UA',
  state: 'Kyiv City',
  lat: 50.45,
  lon: 30.52,
};

const lviv: CityLocation = {
  name: 'Lviv',
  country: 'UA',
  lat: 49.84,
  lon: 24.03,
};

const suggestions = [kyiv, lviv];

function mountSearch(
  props: Partial<{
    query: string;
    suggestions: CityLocation[];
    loading: boolean;
    error: { code: 'network'; message: string } | null;
  }> = {},
) {
  return mount(CitySearch, {
    props: {
      inputId: 'city',
      query: '',
      suggestions: [],
      loading: false,
      error: null,
      ...props,
    },
  });
}

describe('CitySearch', () => {
  it('associates the label with the current query', () => {
    const wrapper = mountSearch({ query: 'Ky' });
    const input = wrapper.get('input');

    expect(wrapper.get('label').attributes('for')).toBe('city');
    expect(input.attributes('id')).toBe('city');
    expect((input.element as HTMLInputElement).value).toBe('Ky');
  });

  it('renders suggestions and emits query and select', async () => {
    const wrapper = mountSearch({ query: 'K', suggestions });

    const options = wrapper.findAll('button[role="option"]');
    expect(options[0]?.text()).toBe('Kyiv, Kyiv City, UA');
    expect(options[1]?.text()).toBe('Lviv, UA');

    await wrapper.get('input').setValue('Ky');
    expect(wrapper.emitted('update:query')?.[0]).toEqual(['Ky']);

    await options[1]?.trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual([lviv]);
  });

  it('moves the active suggestion and selects or dismisses it from the keyboard', async () => {
    const wrapper = mountSearch({ query: 'K', suggestions });
    const input = wrapper.get('input');

    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(input.attributes('aria-activedescendant')).toBe('city-option-0');
    expect(wrapper.get('#city-option-0').attributes('aria-selected')).toBe('true');

    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(input.attributes('aria-activedescendant')).toBe('city-option-1');

    await input.trigger('keydown', { key: 'ArrowUp' });
    expect(input.attributes('aria-activedescendant')).toBe('city-option-0');

    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')?.[0]).toEqual([kyiv]);

    await wrapper.get('.city-search').trigger('keydown', { key: 'Escape' });
    expect(wrapper.get('ul').attributes('style')).toContain('display: none');
    expect(input.attributes('aria-expanded')).toBe('false');

    await wrapper.setProps({ query: 'Ky' });
    expect(wrapper.get('ul').attributes('style') ?? '').not.toContain('display: none');
    expect(input.attributes('aria-expanded')).toBe('true');
    expect(input.attributes('aria-activedescendant')).toBeUndefined();
  });

  it('shows a search loading state and an error', () => {
    const loading = mountSearch({ loading: true });
    expect(loading.text()).toContain('Searching');

    const failed = mountSearch({
      error: { code: 'network', message: 'The weather service could not be reached.' },
    });
    expect(failed.get('[role="alert"]').text()).toContain(
      'The weather service could not be reached.',
    );
  });
});
