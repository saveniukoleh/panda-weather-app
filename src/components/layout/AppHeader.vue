<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSettingsStore, type DisplayTheme } from '../../stores/settingsStore';
import type { LocaleCode } from '../../types/api';

const localeCodes: LocaleCode[] = ['en', 'uk'];
const themes: DisplayTheme[] = ['day', 'night'];
const settings = useSettingsStore();
const { locale, theme } = storeToRefs(settings);
</script>

<template>
  <header class="app-header">
    <h1 class="app-header__title">{{ $t('app.title') }}</h1>
    <div class="app-header__controls">
      <div class="app-header__theme" role="group" :aria-label="$t('theme.label')">
        <button
          v-for="mode in themes"
          :key="mode"
          type="button"
          :aria-pressed="theme === mode"
          :aria-label="$t(`theme.${mode}`)"
          :title="$t(`theme.${mode}`)"
          @click="settings.setTheme(mode)"
        >
          <svg v-if="mode === 'day'" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
              d="M20 15.5A8 8 0 0 1 8.5 4 7 7 0 1 0 20 15.5z"
            />
          </svg>
        </button>
      </div>
      <div class="app-header__language" role="group" :aria-label="$t('language.label')">
        <button
          v-for="code in localeCodes"
          :key="code"
          type="button"
          :aria-pressed="locale === code"
          @click="settings.setLocale(code)"
        >
          {{ $t(`language.${code}`) }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-muted-border);
}

.app-header__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.app-header__controls,
.app-header__theme,
.app-header__language {
  display: flex;
  gap: 0.5rem;
}

.app-header__controls {
  gap: 1rem;
}

.app-header__controls button {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.app-header__theme button {
  display: inline-flex;
  padding: 0.35rem;
}

.app-header__theme svg {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
}

.app-header__language button {
  padding: 0.35rem 0.75rem;
}

.app-header__controls button[aria-pressed='true'] {
  font-weight: 600;
  border-color: var(--color-border-strong);
}
</style>
