<template>
  <!-- fFf : footer pleine largeur (pas de « l » en 1re pos. = pas de marge drawer, comme hHh pour le header) -->
  <q-layout view="hHh Lpr fFf" class="authenticated-layout">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="text-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="white"
          class="q-mr-sm"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <div v-if="$q.screen.gt.xs" class="q-mr-sm">
          <q-img src="icons/logo.jpg" style="width: 140px" alt="CNPS" />
        </div>

        <q-toolbar-title class="text-bold text-center">
          {{ toolbarTitle }}
        </q-toolbar-title>

        <q-space />

        <q-btn
          dense
          flat
          icon="language"
          :label="currentLangLabel"
          no-caps
          color="white"
          class="q-mr-sm"
          style="background-color: rgba(255, 255, 255, 0.18)"
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

        <div class="row items-center no-wrap q-mr-sm">
          <q-avatar size="36px" color="white" text-color="primary" class="text-weight-bold">
            {{ userInitials }}
            <q-tooltip>{{ displayName || t('layout.userUnknown') }}</q-tooltip>
          </q-avatar>
          <span
            v-if="$q.screen.gt.sm && displayName"
            class="text-caption text-white q-ml-sm text-weight-medium user-name-ellipsis"
          >
            {{ displayName }}
          </span>
        </div>

        <q-btn
          flat
          dense
          round
          icon="logout"
          color="white"
          :aria-label="t('logout')"
          @click="logout"
        >
          <q-tooltip>{{ t('logout') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      bordered
      :width="280"
      :breakpoint="1024"
      class="authenticated-drawer"
    >
      <q-scroll-area class="fit">
        <div class="authenticated-drawer__brand q-px-lg q-py-md">
          <div class="authenticated-drawer__brand-title">{{ drawerTitle }}</div>
        </div>
        <AppSidebarNav :items="menuItems" />
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="app-page-shell">
      <slot />
    </q-page-container>

    <q-footer reveal elevated class="bg-primary text-white authenticated-footer">
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
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import AppSidebarNav from 'components/layout/AppSidebarNav.vue'
import { useAuthenticatedSession } from 'src/composables/useAuthenticatedSession.js'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true,
  },
  sessionConfig: {
    type: Object,
    required: true,
  },
  toolbarTitleKey: {
    type: String,
    default: 'title',
  },
  drawerTitleKey: {
    type: String,
    default: 'layout.sidebar.navTitle',
  },
})

const $q = useQuasar()
const { locale, t } = useI18n()

const leftDrawerOpen = ref(true)

const { displayName, userInitials, logout } = useAuthenticatedSession(props.sessionConfig)

const toolbarTitle = computed(() => {
  const key = props.toolbarTitleKey
  const translated = t(key)
  return translated === key ? key : translated
})

const drawerTitle = computed(() => t(props.drawerTitleKey))

const currentLangLabel = computed(() => (locale.value === 'fr' ? 'FR' : 'EN'))

watch(
  () => $q.screen.gt.md,
  (isDesktop) => {
    if (isDesktop) {
      leftDrawerOpen.value = true
    }
  },
  { immediate: true },
)

function changeLang(lang) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>

<style scoped>
.flag {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
}

.user-name-ellipsis {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style>
.authenticated-drawer {
  background: #ffffff !important;
  border-right: 1px solid #e5e7eb !important;
}

.authenticated-drawer .q-drawer__content {
  background: transparent !important;
}

.authenticated-drawer__brand {
  border-bottom: 1px solid #e5e7eb;
}

.authenticated-drawer__brand-title {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #111827;
}

/* Footer fixe (F) au-dessus du drawer au scroll reveal */
.authenticated-layout .q-drawer.authenticated-drawer {
  z-index: 2000;
}

.authenticated-layout .q-footer.authenticated-footer {
  z-index: 2100;
}
</style>
