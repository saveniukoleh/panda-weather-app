import { config } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import { i18n } from '../i18n';
import { LOCALE_STORAGE_KEY } from '../stores/settingsStore';

config.global.plugins.push(i18n);

beforeEach(() => {
  i18n.global.locale.value = 'en';
  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch {
    // A test may replace localStorage.
  }
});
