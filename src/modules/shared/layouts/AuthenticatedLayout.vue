<template>
  <!-- fFf : footer pleine largeur (pas de « l » en 1re pos. = pas de marge drawer, comme hHh pour le header) -->
  <q-layout view="hHh Lpr fFf" class="authenticated-layout">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="text-white authenticated-toolbar">
        <div class="authenticated-toolbar__side authenticated-toolbar__side--left">
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
        </div>

        <div class="authenticated-toolbar__title text-bold">
          {{ toolbarTitle }}
        </div>

        <div class="authenticated-toolbar__side authenticated-toolbar__side--right">
          <q-btn
            dense
            flat
            icon="language"
            :label="currentLangLabel"
            no-caps
            color="white"
            class="q-mr-sm authenticated-toolbar__lang-btn"
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

          <UserProfileMenu
            v-if="showProfileMenu"
            :display-name="displayName"
            :user-initials="userInitials"
            :user-profile="userProfile"
            :persist-user-profile="persistUserProfile"
            :change-sim-password="changeSimPassword"
            class="q-mr-sm"
          />

          <div v-else class="row items-center no-wrap q-mr-sm">
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

          <LogoutMenuButton @confirm="performLogout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      bordered
      :width="drawerComputedWidth"
      :mini-width="auraSidebar ? 64 : undefined"
      :breakpoint="drawerBreakpoint"
      :mini="drawerComputedMini"
      :overlay="!isDrawerDesktop"
      :class="drawerComputedClass"
      :content-class="auraSidebar ? '' : drawerContentClass"
      @mouseover="onDrawerMouseOver"
      @mouseout="onDrawerMouseOut"
    >
      <AuraSidebarShell
        v-if="auraSidebar"
        v-model:mini-mode="miniMode"
        :brand-title="auraBrandTitle"
        :brand-caption="auraBrandCaption"
        :brand-icon="auraBrandIcon"
        :sidebar-title="sidebarTitle"
        :user-initials="userInitials"
        :user-name="sidebarUserName"
        :user-email="sidebarUserEmail"
        :show-brand-block="showSidebarBrand"
        :show-user-block="showSidebarUser"
        :show-collapse-button="isDrawerDesktop"
      >
        <slot v-if="$slots.sidebar" name="sidebar" />
        <AppSidebarNav
          v-else-if="menuItems.length"
          :items="menuItems"
          :mini-mode="miniMode"
          :nav-section-label="t('layout.sidebar.navSectionPrincipal')"
          @navigate="closeDrawerOnMobile"
        />
      </AuraSidebarShell>

      <q-scroll-area v-else class="fit authenticated-drawer__scroll">
        <div v-if="showDrawerBrand" class="authenticated-drawer__brand">
          <div class="authenticated-drawer__brand-title">{{ drawerTitle }}</div>
        </div>
        <slot v-if="$slots.sidebar" name="sidebar" />
        <AppSidebarNav
          v-else-if="menuItems.length"
          :items="menuItems"
          @navigate="closeDrawerOnMobile"
        />
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="app-page-shell">
      <slot />
    </q-page-container>

    <q-footer reveal elevated class="bg-primary text-white authenticated-footer">
      <q-toolbar>
        <q-toolbar-title class="text-bold text-center" style="font-size: 15px">
          <template v-if="footerSimple">
            Copyright © {{ new Date().getFullYear() }} {{ t('footer.rights') }}
          </template>
          <template v-else>
            Copyright © 2021-{{ new Date().getFullYear() }} {{ t('footer.rights') }} <br />
            "{{ t('footer.message') }}"
          </template>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import AppSidebarNav from 'src/modules/shared/components/layout/AppSidebarNav.vue'
import AuraSidebarShell from 'src/modules/shared/components/layout/AuraSidebarShell.vue'
import UserProfileMenu from 'src/modules/shared/components/layout/UserProfileMenu.vue'
import LogoutMenuButton from 'src/modules/shared/components/layout/LogoutMenuButton.vue'
import { useAuthenticatedSession } from 'src/modules/shared/composables/useAuthenticatedSession.js'
import { formatUserDisplayName } from 'src/modules/shared/utils/userDisplay.js'

const AURA_DRAWER_WIDTH = 260

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
  toolbarTitleMobileKey: {
    type: String,
    default: '',
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
  showProfileMenu: {
    type: Boolean,
    default: false,
  },
  footerSimple: {
    type: Boolean,
    default: false,
  },
  auraSidebar: {
    type: Boolean,
    default: false,
  },
  auraBrandTitleKey: {
    type: String,
    default: 'layout.energizer.toolbarTitle',
  },
  auraBrandCaptionKey: {
    type: String,
    default: 'layout.sidebar.auraBrandCaption',
  },
  auraBrandIcon: {
    type: String,
    default: 'bolt',
  },
  showSidebarUser: {
    type: Boolean,
    default: true,
  },
  showSidebarBrand: {
    type: Boolean,
    default: true,
  },
  sidebarTitleKey: {
    type: String,
    default: '',
  },
})

const $q = useQuasar()
const route = useRoute()
const { locale, t } = useI18n()

const leftDrawerOpen = ref(false)
const miniState = ref(true)
const miniMode = ref(false)

const isDrawerDesktop = computed(() => $q.screen.width >= props.drawerBreakpoint)

const authSession = useAuthenticatedSession(props.sessionConfig)

const displayName = authSession.displayName
const userInitials = authSession.userInitials
const userProfile = authSession.userProfile
const persistUserProfile = authSession.persistUserProfile
const changeSimPassword = authSession.changeSimPassword
const performLogout = authSession.performLogout

const effectiveDrawerWidth = computed(() => {
  const max = props.drawerWidth
  const w = $q.screen.width
  if (w < 360) return Math.min(max, w - 40)
  if (w < props.drawerBreakpoint) return Math.min(max, Math.round(w * 0.86))
  return max
})

const drawerComputedWidth = computed(() => {
  if (props.auraSidebar && isDrawerDesktop.value) return AURA_DRAWER_WIDTH
  return effectiveDrawerWidth.value
})

const drawerComputedMini = computed(() => {
  if (props.auraSidebar && isDrawerDesktop.value) return miniMode.value
  if (props.drawerMini && isDrawerDesktop.value) return miniState.value
  return false
})

const drawerComputedClass = computed(() => {
  if (props.auraSidebar) {
    return ['aura-drawer', { 'aura-drawer--overlay': !isDrawerDesktop.value }]
  }
  return [props.drawerClass, { 'authenticated-drawer--overlay': !isDrawerDesktop.value }]
})

const auraBrandTitle = computed(() => {
  const translated = t(props.auraBrandTitleKey)
  return translated === props.auraBrandTitleKey ? props.auraBrandTitleKey : translated
})

const auraBrandCaption = computed(() => {
  const translated = t(props.auraBrandCaptionKey)
  return translated === props.auraBrandCaptionKey ? props.auraBrandCaptionKey : translated
})

const sidebarTitle = computed(() => {
  if (!props.sidebarTitleKey) return ''
  const translated = t(props.sidebarTitleKey)
  return translated === props.sidebarTitleKey ? props.sidebarTitleKey : translated
})

const sidebarUserName = computed(() =>
  formatUserDisplayName(userProfile.value, displayName.value) || t('layout.userUnknown'),
)

const sidebarUserEmail = computed(
  () => userProfile.value?.email || userProfile.value?.login || '—',
)

function onDrawerMouseOver() {
  if (!props.auraSidebar && props.drawerMini && isDrawerDesktop.value) {
    miniState.value = false
  }
}

function onDrawerMouseOut() {
  if (!props.auraSidebar && props.drawerMini && isDrawerDesktop.value) {
    miniState.value = true
  }
}

function syncDrawerForViewport() {
  leftDrawerOpen.value = isDrawerDesktop.value
}

function closeDrawerOnMobile() {
  if (!isDrawerDesktop.value) {
    leftDrawerOpen.value = false
  }
}

onMounted(() => {
  syncDrawerForViewport()
})

provide('closeSidebarOnMobile', closeDrawerOnMobile)
provide('auraSidebarMiniMode', miniMode)

const toolbarTitle = computed(() => {
  const useMobile = props.toolbarTitleMobileKey && $q.screen.lt.sm
  const key = useMobile ? props.toolbarTitleMobileKey : props.toolbarTitleKey
  const translated = t(key)
  return translated === key ? key : translated
})

const drawerTitle = computed(() => t(props.drawerTitleKey))

const currentLangLabel = computed(() => (locale.value === 'fr' ? 'FR' : 'EN'))

watch(
  () => $q.screen.width,
  () => {
    syncDrawerForViewport()
    if (!isDrawerDesktop.value) {
      miniMode.value = false
    }
  },
)

watch(
  () => route.fullPath,
  () => {
    closeDrawerOnMobile()
  },
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

.authenticated-toolbar {
  position: relative;
  min-height: 56px;
}

.authenticated-toolbar__side {
  display: flex;
  align-items: center;
  z-index: 1;
}

.authenticated-toolbar__side--left {
  flex: 1;
  min-width: 0;
}

.authenticated-toolbar__side--right {
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
}

.authenticated-toolbar__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  max-width: min(52vw, 420px);
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 599px) {
  .authenticated-toolbar__title {
    font-size: 0.82rem;
    max-width: 42vw;
    padding-right: 6px;
    transform: translateX(calc(-50% - 10px));
  }

  .authenticated-toolbar__lang-btn {
    margin-left: 12px;
  }
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
.authenticated-drawer--overlay {
  box-shadow: 8px 0 36px rgba(15, 23, 42, 0.24) !important;
}

.authenticated-layout .q-drawer.authenticated-drawer,
.authenticated-layout .q-drawer.aura-drawer {
  z-index: 2000;
}

.authenticated-layout .q-footer.authenticated-footer {
  z-index: 2100;
}
</style>
