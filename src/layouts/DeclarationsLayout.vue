<template>
  <q-layout view="lHh Lpr lFf" class="declarations-layout">
    <q-header class="declarations-header">
      <q-toolbar class="declarations-header__toolbar">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          :to="{ name: 'module-portal' }"
        >
          <q-tooltip>{{ t('modules.portal.backToPortal') }}</q-tooltip>
        </q-btn>

        <div class="declarations-header__brand col">
          <div class="row items-center justify-center no-wrap">
            <q-avatar size="40px" class="declarations-header__logo q-mr-sm">
              <q-icon name="assignment" size="22px" />
            </q-avatar>
            <div class="column items-center declarations-header__titles">
              <span class="declarations-header__title">{{ t('modules.declarations.layoutTitle') }}</span>
              <span class="declarations-header__subtitle">{{ t('modules.declarations.layoutSubtitle') }}</span>
            </div>
          </div>
        </div>
        <q-space class="gt-xs" style="width: 40px" />
      </q-toolbar>
    </q-header>

    <q-page-container class="declarations-layout__page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.declarations-layout {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.declarations-header {
  background: linear-gradient(135deg, #0d47a1 0%, var(--q-primary, #1976d2) 48%, #42a5f5 100%);
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.35);
}

.declarations-header__toolbar {
  min-height: 64px;
  padding-left: 8px;
  padding-right: 16px;
}

.declarations-header__logo {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.declarations-header__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.declarations-header__subtitle {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 500;
}

.declarations-layout__page {
  background: #f4f6f9;
}
</style>
