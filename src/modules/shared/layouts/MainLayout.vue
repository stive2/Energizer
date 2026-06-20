<template>
  <AuthenticatedLayout
    :menu-items="menuItems"
    :sidebar-footer-menu-items="dossiersMenuItems"
    :session-config="energizerSessionConfig"
    toolbar-title-key="layout.energizer.toolbarTitle"
    toolbar-title-mobile-key="layout.energizer.toolbarTitleMobile"
    :toolbar-quick-links="toolbarLinks"
    :page-banner-text="centreLabel"
    :login-history-link="loginHistoryLink"
    :show-drawer-brand="false"
    show-profile-menu
    footer-simple
    aura-sidebar
    sidebar-nav-section-label=""
    :show-sidebar-brand="false"
    :show-sidebar-user="false"
    show-route-breadcrumbs
    :breadcrumb-prepend-home="false"
  >
    <router-view />
  </AuthenticatedLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import AuthenticatedLayout from 'src/modules/shared/layouts/AuthenticatedLayout.vue'
import { energizerSessionConfig } from 'src/modules/energizer/config/energizerMenu.js'
import {
  useEnergizerSidebarMenu,
  useEnergizerToolbarContext,
} from 'src/modules/energizer/composables/useEnergizerShell.js'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'
import { refreshEnergizerSessionForCurrentUser } from 'src/modules/energizer/utils/refreshEnergizerSessionForCurrentUser.js'
import { readAgentLogin } from 'src/modules/energizer/utils/syncAuthUserFromEnergizer.js'

const sessionStore = useEnergizerSessionStore()
const login = readAgentLogin()
sessionStore.hydrateFromStorage(login)

const { menuItems, dossiersMenuItems } = useEnergizerSidebarMenu()
const { centreLabel, toolbarLinks, loginHistoryLink } = useEnergizerToolbarContext()

onMounted(async () => {

  const refreshed = await refreshEnergizerSessionForCurrentUser()
  if (!refreshed?.sidebarMenu?.length && !sessionStore.legacyMenuGroups.length) {
    sessionStore.hydrateFromStorage(login)
  }
})
</script>
