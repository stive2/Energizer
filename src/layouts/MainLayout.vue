<template>
  <AuthenticatedLayout
    :menu-items="energizerMenu"
    :session-config="energizerSessionConfig"
    toolbar-title-key="layout.energizer.toolbarTitle"
    toolbar-title-mobile-key="layout.energizer.toolbarTitleMobile"
    :show-drawer-brand="false"
    show-profile-menu
    footer-simple
    aura-sidebar
    :show-sidebar-brand="false"
    :show-sidebar-user="false"
  >
    <router-view />
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from 'layouts/AuthenticatedLayout.vue'
import { energizerMenu, energizerSessionConfig } from 'src/config/menus/energizerMenu.js'
</script>
