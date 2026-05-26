<template>
  <q-layout view="lHh Lpr lFf" class="declarations-layout">
    <q-header elevated class="declarations-header">
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

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-primary text-white declarations-footer">
      <q-toolbar class="declarations-footer__toolbar">
        <q-toolbar-title class="text-bold text-center text-white declarations-footer__title">
          © {{ new Date().getFullYear() }} CNPS Cameroun
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.declarations-layout {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* Identique à PortalLayout — ne pas toucher au min-height inline de QPage */
.declarations-layout :deep(.q-page-container) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.declarations-header {
  background: linear-gradient(135deg, #0d47a1 0%, var(--q-primary, #1976d2) 48%, #42a5f5 100%);
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.35);
}

.declarations-header__toolbar {
  min-height: 60px;
  padding-left: 6px;
  padding-right: 12px;
}

.declarations-header__brand {
  min-width: 0;
}

.declarations-header__logo {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.declarations-header__title {
  font-size: clamp(0.92rem, 2vw, 1.05rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-align: center;
}

.declarations-header__subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-align: center;
}

.declarations-footer :deep(.declarations-footer__toolbar) {
  min-height: calc(var(--q-toolbar-min-height, 50px) - 8px);
  padding-top: 0;
  padding-bottom: 0;
}

.declarations-footer__title {
  font-size: 14px;
}
</style>
