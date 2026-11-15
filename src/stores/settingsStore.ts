import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { LocaleCode } from '../types/api';

export const LOCALE_STORAGE_KEY = 'panda-weather.locale';

const LOCALES: readonly LocaleCode[] = ['en', 'uk'];

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

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<LocaleCode>(readStoredLocale());

  watch(
    locale,
    (value) => {
      persistLocale(value);
    },
    { flush: 'sync' },
  );

  function setLocale(next: LocaleCode): void {
    locale.value = next;
  }

  return { locale, setLocale };
});
