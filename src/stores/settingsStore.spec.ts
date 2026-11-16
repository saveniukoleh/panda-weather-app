import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_STORAGE_KEY, THEME_STORAGE_KEY, useSettingsStore } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('defaults to English and persists a selected locale', () => {
    const store = useSettingsStore();
    expect(store.locale).toBe('en');

    store.setLocale('uk');
    expect(store.locale).toBe('uk');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('uk');

    setActivePinia(createPinia());
    expect(useSettingsStore().locale).toBe('uk');
  });

  it('falls back to English when the stored locale is missing or invalid', () => {
    expect(useSettingsStore().locale).toBe('en');

    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    setActivePinia(createPinia());
    expect(useSettingsStore().locale).toBe('en');

    localStorage.setItem(LOCALE_STORAGE_KEY, 'uk');
    setActivePinia(createPinia());
    expect(useSettingsStore().locale).toBe('uk');
  });

  it('falls back to English when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    setActivePinia(createPinia());
    const missing = useSettingsStore();
    expect(missing.locale).toBe('en');
    expect(() => missing.setLocale('uk')).not.toThrow();
    expect(missing.locale).toBe('uk');

    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('get denied');
      },
      setItem: () => {
        throw new Error('set denied');
      },
    });
    setActivePinia(createPinia());
    const blocked = useSettingsStore();
    expect(blocked.locale).toBe('en');
    expect(() => blocked.setLocale('uk')).not.toThrow();
    expect(blocked.locale).toBe('uk');
  });

  it('persists the theme and ignores an invalid stored value', () => {
    const store = useSettingsStore();
    expect(store.theme).toBe('day');

    store.setTheme('night');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('night');

    setActivePinia(createPinia());
    expect(useSettingsStore().theme).toBe('night');

    localStorage.setItem(THEME_STORAGE_KEY, 'dusk');
    setActivePinia(createPinia());
    expect(useSettingsStore().theme).toBe('day');
  });
});
