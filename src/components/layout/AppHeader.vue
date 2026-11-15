<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LocaleCode } from '../../types/api';

const localeCodes: LocaleCode[] = ['en', 'uk'];
const settings = useSettingsStore();
const { locale } = storeToRefs(settings);
</script>

<template>
  <header class="app-header">
    <h1 class="app-header__title">{{ $t('app.title') }}</h1>
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
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #ddd;
}

.app-header__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.app-header__language {
  display: flex;
  gap: 0.5rem;
}

.app-header__language button {
  padding: 0.35rem 0.75rem;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}

.app-header__language button[aria-pressed='true'] {
  font-weight: 600;
  border-color: #111;
}
</style>
