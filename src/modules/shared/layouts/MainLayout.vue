<template>
  <AuthenticatedLayout
    :menu-items="menuItems"
    :session-config="energizerSessionConfig"
    toolbar-title-key="layout.energizer.toolbarTitle"
    toolbar-title-mobile-key="layout.energizer.toolbarTitleMobile"
    :show-drawer-brand="false"
    show-profile-menu
    footer-simple
    aura-sidebar
    sidebar-nav-section-label=""
    :show-sidebar-brand="false"
    :show-sidebar-user="false"
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
} from 'src/modules/energizer/composables/useEnergizerShell.js'
import { useEnergizerSessionStore } from 'src/modules/energizer/stores/energizerSessionStore.js'

const sessionStore = useEnergizerSessionStore()
const { menuItems } = useEnergizerSidebarMenu()

onMounted(() => {
  sessionStore.hydrateFromStorage()
})
</script>
