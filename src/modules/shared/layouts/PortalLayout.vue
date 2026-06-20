<template>
  <q-layout view="lHh Lpr lFf" class="portal-root-layout">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <div v-if="$q.screen.gt.xs">
          <router-link to="/">
            <q-img
              src="icons/logo.jpg"
              style="width: 140px; cursor: pointer"
              class="q-ml-sm logo"
            />
          </router-link>
        </div>
        <q-toolbar-title class="text-bold text-center text-white">
          {{ t('modules.portal.toolbarTitle') }}
        </q-toolbar-title>
        <q-btn
          dense
          flat
          icon="language"
          :label="currentLangLabel"
          no-caps
          color="white"
          style="background-color: rgba(255, 255, 255, 0.18)"
          rounded
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="changeLang('fr')">
                <q-item-section>Français</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLang('en')">
                <q-item-section>English</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-primary text-white portal-footer">
      <q-toolbar class="portal-footer__toolbar">
        <q-toolbar-title class="text-bold text-center text-white" style="font-size: 14px">
          © {{ new Date().getFullYear() }} CNPS Cameroun
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

const currentLangLabel = computed(() => (locale.value === 'fr' ? 'FR' : 'EN'))

function changeLang(lang) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>

<style scoped>
.portal-root-layout {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
}

.portal-root-layout :deep(.q-page-container) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.portal-footer :deep(.portal-footer__toolbar) {
  min-height: calc(var(--q-toolbar-min-height, 50px) - 8px);
  padding-top: 0;
  padding-bottom: 0;
}
</style>
