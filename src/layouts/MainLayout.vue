<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <div v-if="$q.screen.gt.xs" class="">
          <q-img src="icons/logo.jpg" style="width: 150px" class="q-ml-md logo" />
        </div>
        <q-toolbar-title class="text-bold text-center">
          <span class="q-mx-md">{{ t('title') }}</span>
        </q-toolbar-title>
        <q-btn
          dense
          flat
          icon="language"
          :label="currentLangLabel"
          no-caps
          color="primary"
          style="background-color: white"
          rounded
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="changeLang('fr')">
                <q-item-section avatar>
                  <img src="flags/fr.svg" alt="FR" class="flag" />
                </q-item-section>
                <q-item-section>Français</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLang('en')">
                <q-item-section avatar>
                  <img src="flags/en.svg" alt="EN" class="flag" />
                </q-item-section>
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
    <q-footer reveal elevated>
      <q-toolbar>
        <q-toolbar-title class="text-bold text-center" style="font-size: 15px">
          Copyright © 2021-{{ new Date().getFullYear() }} {{ t('footer.rights') }} <br />
          "{{ t('footer.message') }}"
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const { locale, t } = useI18n()

const changeLang = (lang) => {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

const currentLangLabel = computed(() => (locale.value === 'fr' ? 'Français 🇫🇷' : 'English 🇬🇧'))
</script>

<style scoped>
.lang-switch {
  top: 1rem;
  right: 1rem;
}

.flag {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
}

.q-toolbar-title {
  font-weight: bold;
  text-align: center;
}
</style>
