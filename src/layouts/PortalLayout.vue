<template>
  <q-layout view="lHh Lpr lFf" class="portal-root-layout">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <div v-if="$q.screen.gt.xs">
          <q-img src="icons/logo.jpg" style="width: 140px" class="q-ml-sm logo" />
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

    <q-footer reveal elevated class="bg-primary text-white">
      <q-toolbar>
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
  min-height: 100vh;
}
</style>
