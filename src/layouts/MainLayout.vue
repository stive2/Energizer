<template>
  <AuthenticatedLayout
    :menu-items="energizerMenu"
    :session-config="energizerSessionConfig"
    toolbar-title-key="title"
    drawer-title-key="layout.sidebar.navTitleEnergizer"
  >
    <router-view />
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from 'layouts/AuthenticatedLayout.vue'
import { energizerMenu, energizerSessionConfig } from 'src/config/menus/energizerMenu.js'
</script>
