import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { LocaleCode } from '../types/api';

export const LOCALE_STORAGE_KEY = 'panda-weather.locale';
export const THEME_STORAGE_KEY = 'panda-weather.theme';

export type DisplayTheme = 'day' | 'night';

const LOCALES: readonly LocaleCode[] = ['en', 'uk'];
const THEMES: readonly DisplayTheme[] = ['day', 'night'];

function storageOrNull(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    if (
      !storage ||
      typeof storage.getItem !== 'function' ||
      typeof storage.setItem !== 'function'
    ) {
      return null;
    }
    return storage;
  } catch {
    return null;
  }
}

function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((locale) => locale === value);
}

export function readStoredLocale(): LocaleCode {
  const storage = storageOrNull();
  if (storage === null) return 'en';
  try {
    const raw = storage.getItem(LOCALE_STORAGE_KEY);
    if (raw !== null && isLocaleCode(raw)) return raw;
    return 'en';
  } catch {
    return 'en';
  }
}

function persistLocale(locale: LocaleCode): void {
  const storage = storageOrNull();
  if (storage === null) return;
  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The in-memory locale stays usable when storage rejects the write.
  }
}

function isDisplayTheme(value: string): value is DisplayTheme {
  return THEMES.some((theme) => theme === value);
}

export function readStoredTheme(): DisplayTheme {
  const storage = storageOrNull();
  if (storage === null) return 'day';
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    if (raw !== null && isDisplayTheme(raw)) return raw;
    return 'day';
  } catch {
    return 'day';
  }
}

function persistTheme(theme: DisplayTheme): void {
  const storage = storageOrNull();
  if (storage === null) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The in-memory theme stays usable when storage rejects the write.
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<LocaleCode>(readStoredLocale());
  const theme = ref<DisplayTheme>(readStoredTheme());

  watch(
    locale,
    (value) => {
      persistLocale(value);
    },
    { flush: 'sync' },
  );

  watch(
    theme,
    (value) => {
      persistTheme(value);
    },
    { flush: 'sync' },
  );

  function setLocale(next: LocaleCode): void {
    locale.value = next;
  }

  function setTheme(next: DisplayTheme): void {
    theme.value = next;
  }

  return { locale, setLocale, theme, setTheme };
});
