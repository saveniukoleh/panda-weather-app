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
          @click="settings.setTheme(mode)"
        >
          {{ $t(`theme.${mode}`) }}
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
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.app-header__controls button[aria-pressed='true'] {
  font-weight: 600;
  border-color: var(--color-border-strong);
}
</style>
