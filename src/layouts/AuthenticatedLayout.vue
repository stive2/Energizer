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
      :width="drawerWidth"
      :breakpoint="drawerBreakpoint"
      :mini="drawerMini ? miniState : false"
      :class="drawerClassList"
      :content-class="drawerContentClass"
      @mouseover="onDrawerMouseOver"
      @mouseout="onDrawerMouseOut"
    >
      <q-scroll-area class="fit authenticated-drawer__scroll">
        <div v-if="showDrawerBrand" class="authenticated-drawer__brand">
          <div class="authenticated-drawer__brand-title">{{ drawerTitle }}</div>
        </div>
        <slot v-if="$slots.sidebar" name="sidebar" />
        <AppSidebarNav
          v-else-if="menuItems.length"
          :items="menuItems"
          :compact-top="!showDrawerBrand"
        />
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
    default: () => [],
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
  showDrawerBrand: {
    type: Boolean,
    default: true,
  },
  drawerWidth: {
    type: Number,
    default: 280,
  },
  drawerBreakpoint: {
    type: Number,
    default: 1024,
  },
  drawerMini: {
    type: Boolean,
    default: false,
  },
  drawerContentClass: {
    type: String,
    default: '',
  },
  drawerClass: {
    type: String,
    default: 'authenticated-drawer',
  },
})

const $q = useQuasar()
const { locale, t } = useI18n()

const leftDrawerOpen = ref(true)
const miniState = ref(true)

const drawerClassList = computed(() => props.drawerClass)

const { displayName, userInitials, logout } = useAuthenticatedSession(props.sessionConfig)

function onDrawerMouseOver() {
  if (props.drawerMini) {
    miniState.value = false
  }
}

function onDrawerMouseOut() {
  if (props.drawerMini) {
    miniState.value = true
  }
}

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
  --app-sidebar-accent: #2563eb;
  --app-sidebar-accent-light: #3b82f6;
  --app-sidebar-bg: #f7f9fc;
  --app-sidebar-bg-end: #eef2f7;
  --app-sidebar-border: #e2e8f0;
  --app-sidebar-text: #334155;
  --app-sidebar-text-strong: #0f172a;
  --app-sidebar-muted: #64748b;
  --app-sidebar-hover: #e8eef5;
  --app-sidebar-active-bg: #e8f2ff;
  --app-sidebar-active-text: #1d4ed8;
  --app-sidebar-icon-bg: #ffffff;
  --app-sidebar-shadow: 4px 0 28px rgba(15, 23, 42, 0.07);

  background: linear-gradient(180deg, var(--app-sidebar-bg) 0%, var(--app-sidebar-bg-end) 100%) !important;
  border-right: 1px solid var(--app-sidebar-border) !important;
  box-shadow: var(--app-sidebar-shadow);
}

.authenticated-drawer .q-drawer__content {
  background: transparent !important;
}

.authenticated-drawer__scroll :deep(.q-scrollarea__content) {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.authenticated-drawer__brand {
  margin: 14px 14px 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--app-sidebar-border);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.authenticated-drawer__brand-title {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--app-sidebar-text-strong);
}

/* Footer fixe (F) au-dessus du drawer au scroll reveal */
.authenticated-layout .q-drawer.authenticated-drawer {
  z-index: 2000;
}

.authenticated-layout .q-footer.authenticated-footer {
  z-index: 2100;
}
</style>
